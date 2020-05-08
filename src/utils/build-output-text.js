function addSign(newValue, oldValue) {
  if (newValue === oldValue) {
    return '';
  }

  return newValue - oldValue > 0 ? '👍' : '👎';
}

function reportTable(source, change) {
  let table = `**Coverage difference:**

Type|${source.name}|${change.name}
---|---|---
`;

  Object.keys(source.coverage).forEach((key) => {
    const newCoverage = change.coverage[key];
    const originCoverage = source.coverage[key];

    table += `${addSign(newCoverage.pct, originCoverage.pct)} ${key}|${originCoverage.pct} %|${newCoverage.pct} %\n`;
  });

  return table;
}

export function buildOutputText(source, change) {
  const sourceBranch = source;
  const prBranch = change;

  const changedAvgPct = parseFloat((
    change.coverage.lines.pct
    + change.coverage.statements.pct
    + change.coverage.functions.pct
    + change.coverage.branches.pct
  ) / 4).toFixed(2);

  const sourceAvgPct = parseFloat((
    source.coverage.lines.pct
    + source.coverage.statements.pct
    + source.coverage.functions.pct
    + source.coverage.branches.pct
  ) / 4).toFixed(2);

  sourceBranch.coverage.average = {
    pct: sourceAvgPct,
  };

  prBranch.coverage.average = {
    pct: sourceAvgPct,
  };

  const diff = (changedAvgPct - sourceAvgPct).toFixed(2);

  let outputText = '';

  if (parseInt(diff, 10) < 0) {
    outputText += `Coverage dropped by ${diff} 🔴`;
  } else if (parseInt(diff, 10) === 0) {
    outputText += 'Coverage remains the same ✅';
  } else {
    outputText += `Coverage has increased by ${diff} 🎉`;
  }

  outputText += `\n\n${reportTable(sourceBranch, prBranch)}`;

  console.log(outputText);

  return outputText.trim();
}
