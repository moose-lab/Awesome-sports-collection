import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatDuration, formatPace } from "./pace.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const program = JSON.parse(readFileSync(join(root, "data", "running", "training-program.json"), "utf8"));

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const weekdayZh = {
  monday: "星期一",
  tuesday: "星期二",
  wednesday: "星期三",
  thursday: "星期四",
  friday: "星期五",
  saturday: "星期六",
  sunday: "星期日"
};

const roundHalf = (value) => Math.round(value * 2) / 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function weekdayName(date) {
  return weekdays[(date.getUTCDay() + 6) % 7];
}

export function allocatePhases(totalWeeks) {
  if (!Number.isInteger(totalWeeks) || totalWeeks < program.plan_limits.weeks.min || totalWeeks > program.plan_limits.weeks.max) {
    throw new Error(`total weeks must be an integer between ${program.plan_limits.weeks.min} and ${program.plan_limits.weeks.max}`);
  }
  const taperWeeks = totalWeeks >= 18 ? 3 : 2;
  const remaining = totalWeeks - taperWeeks;
  const foundationWeeks = Math.max(2, Math.round(remaining * 0.3));
  const specificWeeks = Math.max(2, Math.round(remaining * 0.3));
  const buildWeeks = remaining - foundationWeeks - specificWeeks;
  return [
    ...Array(foundationWeeks).fill("foundation"),
    ...Array(buildWeeks).fill("build"),
    ...Array(specificWeeks).fill("specific"),
    ...Array(taperWeeks).fill("taper")
  ];
}

function weeklyVolumeCurve(profile, phases) {
  const preTaperWeeks = phases.findIndex((phase) => phase === "taper");
  const taperCount = phases.length - preTaperWeeks;
  return phases.map((phase, index) => {
    if (phase === "taper") {
      const taperIndex = index - preTaperWeeks;
      const factors = taperCount === 3 ? [0.8, 0.6, 0.4] : [0.65, 0.4];
      return roundHalf(profile.peak_weekly_km * factors[taperIndex]);
    }
    const fraction = preTaperWeeks <= 1 ? 1 : index / (preTaperWeeks - 1);
    let volume = profile.current_weekly_km + (profile.peak_weekly_km - profile.current_weekly_km) * fraction;
    const weekNumber = index + 1;
    if (weekNumber % program.plan_limits.cutback_every_weeks === 0 && index !== preTaperWeeks - 1) {
      volume *= program.plan_limits.cutback_factor;
    }
    return roundHalf(volume);
  });
}

function longRunCurve(profile, phases, volumes) {
  const preTaperWeeks = phases.findIndex((phase) => phase === "taper");
  const results = [];
  const recent = [profile.longest_run_km];
  for (let index = 0; index < phases.length; index += 1) {
    if (index === phases.length - 1) {
      results.push(0);
      continue;
    }
    if (phases[index] === "taper") {
      const taperLong = roundHalf(Math.min(profile.peak_long_run_km * 0.65, volumes[index] * 0.6));
      results.push(taperLong);
      recent.push(taperLong);
      continue;
    }

    const fraction = preTaperWeeks <= 1 ? 1 : index / (preTaperWeeks - 1);
    let desired = profile.longest_run_km + (profile.peak_long_run_km - profile.longest_run_km) * fraction;
    const weekNumber = index + 1;
    if (weekNumber % program.plan_limits.cutback_every_weeks === 0 && index !== preTaperWeeks - 1) {
      desired *= program.plan_limits.cutback_factor;
    }
    const longestLast30Days = Math.max(...recent.slice(-4));
    const spikeCap = longestLast30Days * (1 + program.plan_limits.single_session_spike_limit);
    const otherRunMinimum = Math.max(0, profile.run_days - 1) * 3;
    const volumeCap = Math.max(6, volumes[index] - otherRunMinimum);
    const value = roundHalf(clamp(desired, 6, Math.min(spikeCap, volumeCap)));
    results.push(value);
    recent.push(value);
  }
  return results;
}

function daysBeforeLong(dayIndex, longIndex) {
  return (longIndex - dayIndex + 7) % 7;
}

function chooseCandidate(candidates, longIndex, targetBefore, excluded = []) {
  return candidates
    .filter((index) => !excluded.includes(index))
    .sort((a, b) => Math.abs(daysBeforeLong(a, longIndex) - targetBefore) - Math.abs(daysBeforeLong(b, longIndex) - targetBefore))[0];
}

function buildRoles(profile, phaseKey, weekDates, raceDate) {
  const availableIndexes = weekDates
    .map((date, index) => (profile.available_days.includes(weekdayName(date)) ? index : -1))
    .filter((index) => index >= 0);
  const raceIndex = weekDates.findIndex((date) => formatDate(date) === raceDate);
  const longIndex = weekDates.findIndex((date) => weekdayName(date) === profile.long_run_day);
  const roles = Array(7).fill("rest");

  if (raceIndex >= 0) {
    roles[raceIndex] = "race";
  } else {
    roles[longIndex] = "long";
  }

  const runCandidates = availableIndexes.filter((index) =>
    index !== longIndex
    && index !== raceIndex
    && (raceIndex < 0 || index < raceIndex)
  );
  const primary = chooseCandidate(runCandidates, raceIndex >= 0 ? raceIndex : longIndex, 5);
  if (primary !== undefined) roles[primary] = phaseKey === "foundation" ? "strides" : "quality_primary";

  const canUseSecondQuality = phaseKey !== "foundation" && profile.level.hard_sessions_per_week >= 2 && profile.run_days >= 5;
  const secondary = canUseSecondQuality
    ? chooseCandidate(runCandidates, raceIndex >= 0 ? raceIndex : longIndex, 3, [primary])
    : undefined;
  if (secondary !== undefined && Math.abs(secondary - primary) > 1 && Math.abs(secondary - (raceIndex >= 0 ? raceIndex : longIndex)) > 1) {
    roles[secondary] = "quality_secondary";
  }

  for (const index of runCandidates) {
    if (roles[index] !== "rest") continue;
    const before = daysBeforeLong(index, raceIndex >= 0 ? raceIndex : longIndex);
    roles[index] = before === 6 ? "recovery" : "easy";
  }
  return roles;
}

function assignDistances(weeklyKm, desiredLongKm, roles) {
  const runIndexes = roles
    .map((role, index) => (!["rest", "race"].includes(role) ? index : -1))
    .filter((index) => index >= 0);
  const longIndex = roles.indexOf("long");
  const distances = Array(7).fill(0);
  let longKm = 0;
  if (longIndex >= 0) {
    longKm = roundHalf(Math.min(desiredLongKm, Math.max(6, weeklyKm - (runIndexes.length - 1) * 3)));
    distances[longIndex] = longKm;
  }

  const remainingIndexes = runIndexes.filter((index) => index !== longIndex);
  const weights = {
    recovery: 0.7,
    easy: 1,
    strides: 1,
    quality_primary: 1.15,
    quality_secondary: 1.15
  };
  const remainingKm = Math.max(0, weeklyKm - longKm);
  const totalWeight = remainingIndexes.reduce((sum, index) => sum + weights[roles[index]], 0);
  remainingIndexes.forEach((index) => {
    distances[index] = roundHalf(remainingKm * weights[roles[index]] / totalWeight);
  });
  if (remainingIndexes.length > 0) {
    const assigned = distances.reduce((sum, value) => sum + value, 0);
    const last = remainingIndexes.at(-1);
    distances[last] = roundHalf(Math.max(0, distances[last] + weeklyKm - assigned));
  }
  return { distances, long_km: longKm };
}

function strengthPrescription(levelKey) {
  if (levelKey === "beginner") {
    return [
      "20-30 min technique strength: split squat, hip hinge, calf/soleus raise, row and trunk carry; 2-3 sets with 2-3 reps in reserve. / 20-30 分钟技术力量：分腿蹲、髋铰链、小腿与比目鱼肌提踵、划船和躯干负重；2-3 组，每组保留 2-3 次余力。"
    ];
  }
  return [
    "30-40 min runner strength: heavy squat or trap-bar pattern, single-leg work, calf/soleus work and low-volume plyometrics; stop before grinding reps. / 30-40 分钟跑者力量：较重深蹲或六角杠模式、单腿训练、小腿与比目鱼肌训练及低量弹跳；不要做到力竭。"
  ];
}

function recoveryAndFuelling(role) {
  if (role === "race") {
    return "Use only rehearsed carbohydrate, fluid, equipment, and caffeine choices; drink to thirst and follow event medical guidance. / 只使用已经演练过的碳水、补水、装备与咖啡因方案；按口渴补水并遵从赛事医疗指引。";
  }
  if (role === "long") {
    return "Recover with normal meals, carbohydrate, protein, fluid to thirst, and sleep; rehearse race fuel if the run exceeds 90 minutes. / 用正常饮食、碳水、蛋白质、按口渴补水和睡眠恢复；超过 90 分钟时演练比赛补给。";
  }
  if (role === "rest") {
    return "Prioritize sleep and sufficient energy availability; gentle mobility is optional only if it leaves you fresher. / 优先保证睡眠与充足能量供给；轻柔活动度仅在做完更清爽时可选。";
  }
  return "Resume normal meals and hydration; protect the next easy/recovery window and do not add hidden intensity. / 正常进食与补水；保护下一次轻松或恢复窗口，不额外叠加强度。";
}

function roleContent(role, phaseKey, distanceKm, weekNumber, profile) {
  const intensity = program.intensity_anchors;
  const commonWarmup = [
    "10-15 min easy jog, then ankle/hip mobility and 4 relaxed drills or strides. / 轻松慢跑 10-15 分钟，随后做踝髋活动和 4 组放松跑姿练习或加速跑。"
  ];
  const commonCooldown = [
    "Jog or walk 8-10 min; record RPE, pain, conditions, and whether the completion standard was met. / 慢跑或步行 8-10 分钟；记录 RPE、疼痛、环境和是否达到完成标准。"
  ];

  if (role === "rest") {
    return {
      type: "rest",
      load_class: "rest",
      title: "Rest and recovery review / 休息与恢复检查",
      intensity: `${intensity.recovery.rpe} · ${intensity.recovery.talk_test}`,
      duration_minutes: 20,
      training_goal: "Absorb training and identify fatigue before it becomes a failed session. / 吸收训练刺激，在疲劳演变成失败训练前识别问题。",
      warmup: [],
      main: ["Rest, or 15-20 min gentle mobility if it leaves you fresher. / 完全休息；若轻柔活动后更舒适，可做 15-20 分钟活动度。"],
      cooldown: [],
      completion_standard: "Finish fresher; no hidden conditioning. / 结束时应更清爽，不把恢复日偷偷练成体能课。",
      source_ids: ["recovery-consensus-2018", "athlete-sleep-consensus-2021"]
    };
  }

  if (role === "race") {
    return {
      type: "race",
      load_class: "race",
      title: "Marathon race day / 马拉松比赛日",
      intensity: "Even effort; first kilometres controlled / 均匀体感；开局克制",
      duration_minutes: profile.performance.target_time_seconds ? Math.ceil(profile.performance.target_time_seconds / 60 + 45) : 360,
      training_goal: "Execute the rehearsed pacing, fuelling, hydration, equipment, and contingency plan. / 执行已经演练过的配速、补给、补水、装备和应急方案。",
      warmup: ["Brief mobility and easy jogging only if it matches rehearsed race routine. / 只做已演练过的简短活动度与轻松慢跑。"],
      main: ["Do not bank time early; run even effort and adjust pace for course, weather, and congestion. / 不在前程透支抢时间；保持均匀体感，并按坡度、天气与拥堵调整速度。"],
      cooldown: ["Keep moving through the finish area, take fluids/food as tolerated, and follow event medical guidance for concerning symptoms. / 完赛后继续缓慢移动，按耐受补充水和食物；出现异常症状遵从赛事医疗指引。"],
      completion_standard: "Pacing and fuelling decisions remain controlled through 30-35 km; stop for medical red flags. / 30-35 公里前配速与补给决策保持可控；出现医疗红旗立即停止。",
      source_ids: ["marathon-pacing-large-scale-2026", "world-athletics-distance-nutrition-2019", "eah-consensus-2015"]
    };
  }

  if (role === "long") {
    const specificBlock = phaseKey === "specific" && weekNumber % 2 === 1
      ? `Include ${roundHalf(Math.min(12, distanceKm * 0.35))} km total at marathon effort in 2-3 blocks, with easy running between. / 总计加入 ${roundHalf(Math.min(12, distanceKm * 0.35))} 公里马拉松体感，分 2-3 段完成，段间轻松跑。`
      : "Keep the full run easy; optional final 15-20 min steady only if readiness is green. / 全程轻松跑；仅在绿灯状态下，最后 15-20 分钟可选稳态跑。";
    return {
      type: "long_run",
      load_class: "long",
      title: phaseKey === "specific" ? "Marathon-specific long run / 马拉松专项长跑" : "Aerobic long run / 有氧长跑",
      intensity: `${intensity.easy.rpe}; marathon blocks ${intensity.marathon.rpe}`,
      duration_minutes: estimateDuration(distanceKm, role, profile),
      training_goal: "Build durable time-on-feet, late-run mechanics, and race-fuelling tolerance. / 建立持久脚下时间、后程动作稳定性和比赛补给耐受。",
      warmup: ["First 10-15 min deliberately easy; check pain, breathing, weather, and planned fluid access. / 前 10-15 分钟刻意放慢；检查疼痛、呼吸、天气与补水条件。"],
      main: [
        `${distanceKm} km total. ${specificBlock}`,
        "If expected duration exceeds 90 min, rehearse the planned carbohydrate and hydration approach; never introduce a new product on race day. / 预计超过 90 分钟时演练比赛补给与补水；比赛日绝不首次尝试新品。"
      ],
      cooldown: commonCooldown,
      completion_standard: "Finish with stable gait and enough control that easy running would still be possible; no sprint finish. / 结束时步态稳定并仍有轻松跑余力；不冲刺收尾。",
      source_ids: ["marathon-training-determinants-meta-2020", "single-session-spike-2025", "world-athletics-distance-nutrition-2019"]
    };
  }

  if (role === "quality_primary") {
    const main = phaseKey === "build"
      ? "4-6 x 5 min at controlled threshold (RPE 7) with 90 sec easy jog; stop when pace or form is no longer repeatable. / 4-6 组 x 5 分钟可控阈值跑（RPE 7），组间 90 秒慢跑；配速或动作无法重复时停止。"
      : phaseKey === "specific"
        ? `Use ${roundHalf(Math.min(12, distanceKm * 0.55))} km total at marathon effort in 2-3 blocks inside the run. / 在本次跑步中分 2-3 段完成总计 ${roundHalf(Math.min(12, distanceKm * 0.55))} 公里马拉松体感。`
        : "3 x 5 min controlled threshold with 2 min easy jog; keep the last rep smooth. / 3 组 x 5 分钟可控阈值，组间慢跑 2 分钟；最后一组仍要顺畅。";
    return {
      type: "quality",
      load_class: "hard",
      title: phaseKey === "specific" ? "Marathon pace blocks / 马拉松配速分段" : "Threshold development / 阈值能力训练",
      intensity: phaseKey === "specific" ? `${intensity.marathon.rpe} · ${intensity.marathon.talk_test}` : `${intensity.threshold.rpe} · ${intensity.threshold.talk_test}`,
      duration_minutes: estimateDuration(distanceKm, role, profile),
      training_goal: phaseKey === "specific" ? "Make target marathon effort economical and repeatable. / 让目标马拉松体感变得经济、可重复。" : "Raise sustainable speed without turning the session into a race. / 提高可持续速度，但不把训练跑成比赛。",
      warmup: commonWarmup,
      main: [`${distanceKm} km total including: ${main}`],
      cooldown: commonCooldown,
      completion_standard: "The final repetition matches the first within normal terrain variation; no all-out finish. / 最后一组在地形允许范围内与第一组保持一致；不全力冲刺。",
      source_ids: ["training-intensity-network-meta-2025", "marathon-pacing-review-2024"]
    };
  }

  if (role === "quality_secondary") {
    const main = phaseKey === "specific"
      ? `Run ${roundHalf(Math.min(14, distanceKm * 0.6))} km continuous at steady-to-marathon effort within the total distance. / 在总距离中连续完成 ${roundHalf(Math.min(14, distanceKm * 0.6))} 公里稳态至马拉松体感。`
      : phaseKey === "taper"
        ? "6 x 1 min at 5K-10K effort with 2 min easy; keep it crisp, not exhaustive. / 6 组 x 1 分钟 5K-10K 体感，组间轻松 2 分钟；保持锐利，不练到疲惫。"
        : "6 x 3 min at controlled 5K-10K effort with 2 min easy jog; identical form on every rep. / 6 组 x 3 分钟可控 5K-10K 体感，组间慢跑 2 分钟；每组动作一致。";
    return {
      type: "quality",
      load_class: "hard",
      title: phaseKey === "specific" ? "Medium-long marathon rhythm / 中长距离马拉松节奏" : "Aerobic power intervals / 有氧能力间歇",
      intensity: phaseKey === "specific" ? `${intensity.marathon.rpe}` : `${intensity.interval.rpe}`,
      duration_minutes: estimateDuration(distanceKm, role, profile),
      training_goal: "Add a second distinct quality stimulus without compromising the long run. / 增加第二种不同质量刺激，同时不破坏长跑质量。",
      warmup: commonWarmup,
      main: [`${distanceKm} km total. ${main}`],
      cooldown: commonCooldown,
      completion_standard: "No pace collapse, no gait change, and normal easy-day readiness within 24-36 hours. / 无配速崩塌、无步态改变，并能在 24-36 小时内恢复到轻松跑状态。",
      source_ids: ["training-intensity-network-meta-2025", "recovery-consensus-2018"]
    };
  }

  if (role === "strides") {
    return {
      type: "easy_strides",
      load_class: "moderate",
      title: "Easy run and relaxed strides / 轻松跑与放松加速跑",
      intensity: `${intensity.easy.rpe}; strides smooth, not sprinting`,
      duration_minutes: estimateDuration(distanceKm, role, profile),
      training_goal: "Build frequency and mechanics before denser quality training. / 在更密集质量课前建立跑频和动作效率。",
      warmup: ["Begin easy and include ankle, calf, hip, and running-drill preparation. / 轻松开始，并加入踝、小腿、髋和跑姿练习。"],
      main: [`${distanceKm} km easy with 6 x 20 sec relaxed strides, full easy recovery. / ${distanceKm} 公里轻松跑，加入 6 组 x 20 秒放松加速跑，组间充分轻松恢复。`],
      cooldown: commonCooldown,
      completion_standard: "Every stride is relaxed and technically cleaner than the previous one. / 每组加速跑都放松，动作比上一组更干净。",
      source_ids: ["training-intensity-network-meta-2025"]
    };
  }

  const recovery = role === "recovery";
  return {
    type: recovery ? "recovery_run" : "easy_run",
    load_class: "easy",
    title: recovery ? "Recovery run / 恢复跑" : "Easy aerobic run / 轻松有氧跑",
    intensity: `${recovery ? intensity.recovery.rpe : intensity.easy.rpe} · ${recovery ? intensity.recovery.talk_test : intensity.easy.talk_test}`,
    duration_minutes: estimateDuration(distanceKm, role, profile),
    training_goal: recovery ? "Increase circulation without adding meaningful fatigue. / 促进循环，不增加明显疲劳。" : "Accumulate low-intensity volume that supports the quality sessions and long run. / 累积低强度跑量，为质量课和长跑提供基础。",
    warmup: ["First 8-10 min very easy; let breathing and gait settle. / 前 8-10 分钟非常轻松，让呼吸和步态自然稳定。"],
    main: [`${distanceKm} km at conversational effort. / ${distanceKm} 公里可对话强度。`],
    cooldown: commonCooldown,
    completion_standard: "Finish with lower or equal RPE than halfway and no pain progression. / 结束时 RPE 不高于中途，且疼痛没有加重。",
    source_ids: ["training-intensity-network-meta-2025", "recovery-consensus-2018"]
  };
}

function estimateDuration(distanceKm, role, profile) {
  const baseMarathonPace = profile.performance.target_pace_seconds_per_km
    ?? { beginner: 390, intermediate: 345, advanced: 305, competitive: 275 }[profile.level_key];
  const paceOffset = {
    recovery: 100,
    easy: 75,
    strides: 65,
    long: 55,
    quality_primary: 25,
    quality_secondary: 25
  }[role] ?? 60;
  return Math.max(30, Math.ceil(distanceKm * (baseMarathonPace + paceOffset) / 60 + (role.startsWith("quality") ? 10 : 0)));
}

function attachStrength(sessions, phaseKey, profile) {
  const targetCount = phaseKey === "taper" ? 0 : phaseKey === "specific" ? 1 : 2;
  const candidates = sessions.filter((session) => ["easy_run", "recovery_run"].includes(session.type));
  candidates.slice(0, targetCount).forEach((session) => {
    const strengthDurationMinutes = profile.level_key === "beginner" ? 25 : 35;
    session.strength = strengthPrescription(profile.level_key);
    session.strength_duration_minutes = strengthDurationMinutes;
    session.duration_minutes += strengthDurationMinutes;
    session.source_ids = [...new Set([...session.source_ids, "strength-running-economy-meta-2024"])];
  });
}

function buildRaceStrategy(profile) {
  const targetSeconds = profile.performance.target_time_seconds;
  const paceSeconds = profile.performance.target_pace_seconds_per_km;
  const checkpointDistances = [5, 10, 21.0975, 30, 35, 40, 42.195];
  const checkpoints = targetSeconds
    ? checkpointDistances.map((distanceKm) => ({
        distance_km: distanceKm,
        elapsed: formatDuration(paceSeconds * distanceKm)
      }))
    : [];
  const carbohydrateRange = targetSeconds && targetSeconds < 9000
    ? program.race_nutrition.carbohydrate_g_per_hour.under_150_minutes
    : program.race_nutrition.carbohydrate_g_per_hour["150_minutes_or_more"];

  return {
    target_time: profile.performance.goal_time_label ?? profile.performance.estimated_marathon_label,
    target_pace: formatPace(paceSeconds),
    confidence: profile.performance.goal_assessment,
    estimate_note: profile.performance.disclaimer,
    strategy: [
      program.race_pacing.default_strategy,
      "Settle into target effort by the first 5 km; if conditions are adverse, protect effort rather than forcing the pace. / 前 5 公里逐步稳定到目标体感；条件不利时保护体感，不强顶配速。",
      "From 30-35 km, decide from breathing, mechanics, and fuelling status; accelerate only if control remains. / 30-35 公里后依据呼吸、动作和补给状态决策；仍可控时才加速。",
      program.race_pacing.course_adjustment
    ],
    checkpoints,
    carbohydrate_g_per_hour: carbohydrateRange,
    nutrition_rules: program.race_nutrition.rules,
    source_ids: program.race_pacing.source_ids.concat(program.race_nutrition.source_ids)
  };
}

export function buildMarathonPlan(profile) {
  const phases = allocatePhases(profile.weeks);
  const volumes = weeklyVolumeCurve(profile, phases);
  const longRuns = longRunCurve(profile, phases, volumes);
  const startDate = parseDate(profile.start_date);

  const weeks = phases.map((phaseKey, index) => {
    const weekNumber = index + 1;
    const weekStart = addDays(startDate, index * 7);
    const weekDates = Array.from({ length: 7 }, (_, dayIndex) => addDays(weekStart, dayIndex));
    const finalWeek = weekNumber === profile.weeks;
    const roles = buildRoles(profile, phaseKey, weekDates, finalWeek ? profile.race_date : undefined);
    const { distances, long_km: longRunKm } = assignDistances(volumes[index], longRuns[index], roles);
    const sessions = weekDates.map((date, dayIndex) => {
      const role = roles[dayIndex];
      const content = roleContent(role, phaseKey, role === "race" ? 42.195 : distances[dayIndex], weekNumber, profile);
      return {
        date: formatDate(date),
        day: weekdayName(date),
        day_label: `${weekdayName(date)} / ${weekdayZh[weekdayName(date)]}`,
        role,
        distance_km: role === "race" ? 42.195 : distances[dayIndex],
        counts_toward_training_volume: role !== "race",
        strength: [],
        strength_duration_minutes: 0,
        ...content,
        recovery_and_fuelling: recoveryAndFuelling(role)
      };
    });
    attachStrength(sessions, phaseKey, profile);
    const actualTrainingKm = roundHalf(sessions
      .filter((session) => session.counts_toward_training_volume)
      .reduce((sum, session) => sum + session.distance_km, 0));
    return {
      week: weekNumber,
      start_date: formatDate(weekStart),
      end_date: formatDate(addDays(weekStart, 6)),
      phase_key: phaseKey,
      phase: program.phases[phaseKey],
      weekly_training_km: actualTrainingKm,
      planned_weekly_km: volumes[index],
      long_run_km: longRunKm,
      is_cutback: weekNumber % program.plan_limits.cutback_every_weeks === 0 && phaseKey !== "taper",
      sessions
    };
  });

  return {
    generated_for: {
      level: profile.level_key,
      plan_weeks: profile.weeks,
      start_date: profile.start_date,
      race_date: profile.race_date,
      run_days: profile.run_days,
      current_weekly_km: profile.current_weekly_km,
      longest_run_km: profile.longest_run_km
    },
    assumptions: profile.assumptions,
    warnings: profile.warnings,
    evidence_boundary: program.meta.heuristic_policy,
    peak_weekly_km: Math.max(...weeks.map((week) => week.weekly_training_km)),
    phases,
    performance: profile.performance,
    race_strategy: buildRaceStrategy(profile),
    safety: program.safety,
    weeks
  };
}

export function adaptWeekForReadiness(week, readiness) {
  const adapted = structuredClone(week);
  adapted.readiness = readiness;
  if (readiness.status === "green") return adapted;

  for (const session of adapted.sessions) {
    if (session.type === "rest") continue;
    if (readiness.status === "red") {
      session.original_type = session.type;
      session.type = "rest";
      session.load_class = "rest";
      session.distance_km = 0;
      session.duration_minutes = 20;
      session.title = "Readiness stop: rest and seek help if needed / 状态红灯：休息并按需寻求专业帮助";
      session.training_goal = program.readiness.red.action;
      session.warmup = [];
      session.main = [program.readiness.red.action];
      session.cooldown = [];
      session.completion_standard = "Do not resume running until the warning condition has resolved or qualified guidance permits it. / 警示情况未解决或尚未获得专业许可前，不恢复跑步。";
      session.recovery_and_fuelling = "Prioritize rest and normal nourishment; seek qualified help when symptoms warrant it. / 优先休息与正常进食；症状需要时寻求专业帮助。";
      session.strength = [];
      session.strength_duration_minutes = 0;
      session.source_ids = [...new Set([...session.source_ids, "acsm-screening-2015", "recovery-consensus-2018"])];
      continue;
    }
    if (session.type === "race") continue;
    const runningDuration = Math.max(15, session.duration_minutes - (session.strength_duration_minutes ?? 0));
    session.distance_km = roundHalf(session.distance_km * readiness.volume_factor);
    session.duration_minutes = Math.max(20, Math.round(runningDuration * readiness.volume_factor));
    if (session.load_class === "hard") {
      session.original_type = session.type;
      session.type = "easy_run";
      session.title = "Readiness-adjusted easy run / 状态调整轻松跑";
    }
    session.load_class = "easy";
    session.intensity = `${program.intensity_anchors.easy.rpe} · ${program.intensity_anchors.easy.talk_test}`;
    session.training_goal = "Maintain consistency while reducing stress until readiness recovers. / 在状态恢复前降低压力，同时保持训练连续性。";
    session.main = [`${session.distance_km} km easy; remove intervals, marathon-pace blocks, and fast finishes. / ${session.distance_km} 公里轻松跑；取消间歇、马拉松配速段与快速收尾。`];
    session.completion_standard = "Conversational throughout, stable gait, and no worsening symptoms; stop if the condition deteriorates. / 全程可对话、步态稳定且症状不加重；情况恶化时停止。";
    session.recovery_and_fuelling = "Restore sleep and normal energy intake; do not compensate later for the removed work. / 恢复睡眠与正常能量摄入；之后不补做被取消的训练。";
    session.strength = [];
    session.strength_duration_minutes = 0;
    session.source_ids = [...new Set([...session.source_ids, "recovery-consensus-2018", "athlete-sleep-consensus-2021"])];
  }
  adapted.weekly_training_km = roundHalf(adapted.sessions
    .filter((session) => session.counts_toward_training_volume)
    .reduce((sum, session) => sum + session.distance_km, 0));
  adapted.long_run_km = adapted.sessions.find((session) => session.type === "long_run")?.distance_km ?? 0;
  return adapted;
}
