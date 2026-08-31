import { sourcesByIds } from "./assets.mjs";

function bulletLines(values, emptyLabel = "None / 无") {
  return values?.length ? values.map((value) => `- ${value}`) : [`- ${emptyLabel}`];
}

function planOverview(plan) {
  return plan.weeks.map((week) =>
    `| ${week.week} | ${week.start_date} | ${week.phase.label_en} / ${week.phase.label_zh} | ${week.weekly_training_km} km | ${week.long_run_km} km | ${week.is_cutback ? "yes / 是" : "no / 否"} |`
  );
}

function sessionLines(session) {
  return [
    `### ${session.date} · ${session.day_label} · ${session.title}`,
    "",
    `- Distance / 距离: ${session.distance_km} km`,
    `- Duration / 时长: about ${session.duration_minutes} min / 约 ${session.duration_minutes} 分钟`,
    `- Intensity / 强度: ${session.intensity}`,
    `- Training goal / 训练目标: ${session.training_goal}`,
    "- Warm-up / 热身:",
    ...bulletLines(session.warmup),
    "- Main set / 主训练:",
    ...bulletLines(session.main),
    "- Cooldown / 放松:",
    ...bulletLines(session.cooldown),
    `- Completion standard / 完成标准: ${session.completion_standard}`,
    `- Recovery and fuelling / 恢复与补给: ${session.recovery_and_fuelling}`,
    ...(session.strength?.length ? ["- Strength / 力量:", ...bulletLines(session.strength)] : []),
    `- Session source IDs / 单课来源: ${session.source_ids.join(", ")}`,
    ""
  ];
}

function raceStrategyLines(strategy) {
  const checkpointLines = strategy.checkpoints.length
    ? strategy.checkpoints.map((checkpoint) => `| ${checkpoint.distance_km} km | ${checkpoint.elapsed} |`)
    : ["| — | Add a recent race or goal time for estimated splits / 补充近期比赛或目标时间后生成估算分段 |"];
  return [
    "## Race strategy / 比赛策略",
    "",
    `- Target time / 目标时间: ${strategy.target_time ?? "not set / 未设置"}`,
    `- Target pace / 目标配速: ${strategy.target_pace ?? "RPE-guided / 按体感"}`,
    `- Confidence / 可信度标签: ${strategy.confidence}`,
    `- Carbohydrate / 碳水: ${strategy.carbohydrate_g_per_hour[0]}-${strategy.carbohydrate_g_per_hour[1]} g/hour, progressively rehearsed / 每小时 ${strategy.carbohydrate_g_per_hour[0]}-${strategy.carbohydrate_g_per_hour[1]} 克，循序演练`,
    "",
    ...bulletLines(strategy.strategy),
    "",
    "| Checkpoint / 检查点 | Estimated elapsed / 估算累计时间 |",
    "| --- | --- |",
    ...checkpointLines,
    "",
    "Nutrition and hydration rules / 补给与补水规则:",
    ...bulletLines(strategy.nutrition_rules),
    "",
    `Estimate boundary / 估算边界: ${strategy.estimate_note}`,
    ""
  ];
}

function sourceLines(plan, week) {
  const ids = new Set([
    ...week.sessions.flatMap((session) => session.source_ids),
    ...plan.race_strategy.source_ids
  ]);
  return sourcesByIds(ids).map((source) =>
    `- [${source.title}](${source.url}) — ${source.evidence_type}; limitation: ${source.limitations.join(" ")}`
  );
}

export function renderMarathonPlanMarkdown(plan, selectedWeek) {
  const readiness = selectedWeek.readiness;
  return [
    "# Marathon Training Plan / 马拉松训练计划",
    "",
    `Level / 水平: ${plan.generated_for.level}`,
    `Dates / 日期: ${plan.generated_for.start_date} → ${plan.generated_for.race_date}`,
    `Length / 周期: ${plan.generated_for.plan_weeks} weeks / 周`,
    `Running frequency / 跑频: ${plan.generated_for.run_days} days/week / 天每周`,
    `Starting load / 起始跑量: ${plan.generated_for.current_weekly_km} km/week`,
    `Planned peak / 计划峰值: ${plan.peak_weekly_km} km/week`,
    `Recent estimate / 近期成绩估算: ${plan.performance.estimated_marathon_label ?? "not available / 暂无"}`,
    `Goal / 目标: ${plan.performance.goal_time_label ?? "not set / 未设置"} (${plan.performance.goal_assessment})`,
    "",
    "## Assumptions and warnings / 假设与提醒",
    "",
    "Assumptions / 假设:",
    ...bulletLines(plan.assumptions),
    "Warnings / 提醒:",
    ...bulletLines(plan.warnings),
    `Evidence boundary / 证据边界: ${plan.evidence_boundary}`,
    "",
    "## Plan overview / 总周期概览",
    "",
    "| Week / 周 | Start / 开始 | Phase / 阶段 | Training km / 训练公里 | Long run / 长跑 | Cutback / 减量 |",
    "| --- | --- | --- | ---: | ---: | --- |",
    ...planOverview(plan),
    "",
    `## Week ${selectedWeek.week} / 第 ${selectedWeek.week} 周`,
    "",
    `Phase / 阶段: ${selectedWeek.phase.label_en} / ${selectedWeek.phase.label_zh}`,
    `Purpose / 目的: ${selectedWeek.phase.purpose}`,
    `Training load / 训练跑量: ${selectedWeek.weekly_training_km} km`,
    `Readiness / 状态灯: ${readiness.status.toUpperCase()} — ${readiness.action}`,
    `Readiness reasons / 状态依据: ${readiness.reasons.join(", ")}`,
    "",
    ...selectedWeek.sessions.flatMap(sessionLines),
    ...raceStrategyLines(plan.race_strategy),
    "## Source anchors / 来源",
    "",
    ...sourceLines(plan, selectedWeek),
    "",
    "Safety / 安全: This is training guidance, not medical advice. Stop and seek qualified help for warning symptoms or pain that changes gait. / 本计划不是医疗建议；出现警示症状或改变步态的疼痛时停止训练并寻求专业帮助。",
    ""
  ].join("\n");
}
