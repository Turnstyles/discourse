import Report from "admin/models/report";

QUnit.module("Report");

function reportWithData(data) {
  return Report.create({
    type: "topics",
    data: _.map(data, (val, index) => {
      return {
        x: moment()
          .subtract(index, "days")
          .format("YYYY-MM-DD"),
        y: val
      };
    })
  });
}

QUnit.test("counts", assert => {
  const report = reportWithData([5, 4, 3, 2, 1, 100, 99, 98, 1000]);

  assert.equal(report.get("todayCount"), 5);
  assert.equal(report.get("yesterdayCount"), 4);
  assert.equal(
    report.valueFor(2, 4),
    6,
    "adds the values for the given range of days, inclusive"
  );
  assert.equal(
    report.get("lastSevenDaysCount"),
    307,
    "sums 7 days excluding today"
  );

  report.set("method", "average");
  assert.equal(
    report.valueFor(2, 4),
    2,
    "averages the values for the given range of days"
  );
});

QUnit.test("percentChangeString", assert => {
  const report = reportWithData([]);

  assert.equal(report.percentChangeString(5, 8), "+60%", "value increased");
  assert.equal(report.percentChangeString(8, 2), "-75%", "value decreased");
  assert.equal(report.percentChangeString(8, 8), "0%", "value unchanged");
  assert.blank(
    report.percentChangeString(0, 8),
    "returns blank when previous value was 0"
  );
  assert.equal(report.percentChangeString(8, 0), "-100%", "yesterday was 0");
  assert.blank(
    report.percentChangeString(0, 0),
    "returns blank when both were 0"
  );
});

QUnit.test("yesterdayCountTitle with valid values", assert => {
  const title = reportWithData([6, 8, 5, 2, 1]).get("yesterdayCountTitle");
  assert.ok(title.indexOf("+60%") !== -1);
  assert.ok(title.match(/Was 5/));
});

QUnit.test("yesterdayCountTitle when two days ago was 0", assert => {
  const title = reportWithData([6, 8, 0, 2, 1]).get("yesterdayCountTitle");
  assert.equal(title.indexOf("%"), -1);
  assert.ok(title.match(/Was 0/));
});

QUnit.test("sevenDaysCountTitle", assert => {
  const title = reportWithData([
    100,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    100,
    100
  ]).get("sevenDaysCountTitle");
  assert.ok(title.match(/-50%/));
  assert.ok(title.match(/Was 14/));
});

QUnit.test("thirtyDaysCountTitle", assert => {
  const report = reportWithData([5, 5, 5, 5]);
  report.set("prev30Days", 10);
  const title = report.get("thirtyDaysCountTitle");

  assert.ok(title.indexOf("+50%") !== -1);
  assert.ok(title.match(/Was 10/));
});

QUnit.test("sevenDaysTrend", assert => {
  let report;
  let trend;

  report = reportWithData([0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  trend = report.get("sevenDaysTrend");
  assert.ok(trend === "no-change");

  report = reportWithData([0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]);
  trend = report.get("sevenDaysTrend");
  assert.ok(trend === "high-trending-up");

  report = reportWithData([0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]);
  trend = report.get("sevenDaysTrend");
  assert.ok(trend === "trending-up");

  report = reportWithData([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]);
  trend = report.get("sevenDaysTrend");
  assert.ok(trend === "high-trending-down");

  report = reportWithData([0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1]);
  trend = report.get("sevenDaysTrend");
  assert.ok(trend === "trending-down");
});

QUnit.test("yesterdayTrend", assert => {
  let report;
  let trend;

  report = reportWithData([0, 1, 1]);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "no-change");

  report = reportWithData([0, 1, 0]);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "high-trending-up");

  report = reportWithData([0, 1.1, 1]);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "trending-up");

  report = reportWithData([0, 0, 1]);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "high-trending-down");

  report = reportWithData([0, 1, 1.1]);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "trending-down");
});

QUnit.test("thirtyDaysTrend", assert => {
  let report;
  let trend;

  report = reportWithData([
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1
  ]);
  report.set("prev30Days", 30);
  trend = report.get("thirtyDaysTrend");
  assert.ok(trend === "no-change");

  report = reportWithData([
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1
  ]);
  report.set("prev30Days", 0);
  trend = report.get("thirtyDaysTrend");
  assert.ok(trend === "high-trending-up");

  report = reportWithData([
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1
  ]);
  report.set("prev30Days", 25);
  trend = report.get("thirtyDaysTrend");
  assert.ok(trend === "trending-up");

  report = reportWithData([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ]);
  report.set("prev30Days", 60);
  trend = report.get("thirtyDaysTrend");
  assert.ok(trend === "high-trending-down");

  report = reportWithData([
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0
  ]);
  report.set("prev30Days", 35);
  trend = report.get("thirtyDaysTrend");
  assert.ok(trend === "trending-down");
});

QUnit.test("higher is better false", assert => {
  let report;
  let trend;

  report = reportWithData([0, 1, 0]);
  report.set("higher_is_better", false);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "high-trending-down");

  report = reportWithData([0, 1.1, 1]);
  report.set("higher_is_better", false);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "trending-down");

  report = reportWithData([0, 0, 1]);
  report.set("higher_is_better", false);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "high-trending-up");

  report = reportWithData([0, 1, 1.1]);
  report.set("higher_is_better", false);
  trend = report.get("yesterdayTrend");
  assert.ok(trend === "trending-up");
});

QUnit.test("small variation (-2/+2% change) is no-change", assert => {
  let report;
  let trend;

  report = reportWithData([0, 1, 1, 1, 1, 1, 1, 0.9, 1, 1, 1, 1, 1, 1, 1]);
  trend = report.get("sevenDaysTrend");
  assert.ok(trend === "no-change");

  report = reportWithData([0, 1, 1, 1, 1, 1, 1, 1.1, 1, 1, 1, 1, 1, 1, 1]);
  trend = report.get("sevenDaysTrend");
  assert.ok(trend === "no-change");
});

QUnit.test("average", assert => {
  let report;

  report = reportWithData([5, 5, 5, 5, 5, 5, 5, 5]);

  report.set("average", true);
  assert.ok(report.get("lastSevenDaysCount") === 5);

  report.set("average", false);
  assert.ok(report.get("lastSevenDaysCount") === 35);
});

QUnit.test("computed labels", assert => {
  const data = [
    {
      username: "joffrey",
      user_id: 1,
      user_avatar: "/",
      flag_count: 1876,
      time_read: 287362,
      note: "This is a long note",
      topic_id: 2,
      topic_title: "Test topic",
      post_number: 3,
      post_raw: "This is the beginning of"
    }
  ];

  const labels = [
    {
      type: "user",
      properties: {
        username: "username",
        id: "user_id",
        avatar: "user_avatar"
      },
      title: "Moderator"
    },
    { property: "flag_count", title: "Flag count" },
    { type: "seconds", property: "time_read", title: "Time read" },
    { type: "text", property: "note", title: "Note" },
    {
      type: "topic",
      properties: {
        title: "topic_title",
        id: "topic_id"
      },
      title: "Topic"
    },
    {
      type: "post",
      properties: {
        topic_id: "topic_id",
        number: "post_number",
        truncated_raw: "post_raw"
      },
      title: "Post"
    }
  ];

  const report = Report.create({
    type: "topics",
    labels,
    data
  });

  const row = report.get("data.0");
  const computedLabels = report.get("computedLabels");

  const usernameLabel = computedLabels[0];
  assert.equal(usernameLabel.mainProperty, "username");
  assert.equal(usernameLabel.sortProperty, "username");
  assert.equal(usernameLabel.title, "Moderator");
  const computedUsernameLabel = usernameLabel.compute(row);
  assert.equal(
    computedUsernameLabel.formatedValue,
    "<a href='/admin/users/1/joffrey'><img alt='' width='20' height='20' src='/' class='avatar' title='joffrey'><span class='username'>joffrey</span></a>"
  );
  assert.equal(computedUsernameLabel.type, "user");
  assert.equal(computedUsernameLabel.value, "joffrey");

  const flagCountLabel = computedLabels[1];
  assert.equal(flagCountLabel.mainProperty, "flag_count");
  assert.equal(flagCountLabel.sortProperty, "flag_count");
  assert.equal(flagCountLabel.title, "Flag count");
  const computedFlagCountLabel = flagCountLabel.compute(row);
  assert.equal(computedFlagCountLabel.formatedValue, "1.9k");
  assert.equal(computedFlagCountLabel.type, "number");
  assert.equal(computedFlagCountLabel.value, 1876);

  const timeReadLabel = computedLabels[2];
  assert.equal(timeReadLabel.mainProperty, "time_read");
  assert.equal(timeReadLabel.sortProperty, "time_read");
  assert.equal(timeReadLabel.title, "Time read");
  const computedTimeReadLabel = timeReadLabel.compute(row);
  assert.equal(computedTimeReadLabel.formatedValue, "3d");
  assert.equal(computedTimeReadLabel.type, "seconds");
  assert.equal(computedTimeReadLabel.value, 287362);

  const noteLabel = computedLabels[3];
  assert.equal(noteLabel.mainProperty, "note");
  assert.equal(noteLabel.sortProperty, "note");
  assert.equal(noteLabel.title, "Note");
  const computedNoteLabel = noteLabel.compute(row);
  assert.equal(computedNoteLabel.formatedValue, "This is a long note");
  assert.equal(computedNoteLabel.type, "text");
  assert.equal(computedNoteLabel.value, "This is a long note");

  const topicLabel = computedLabels[4];
  assert.equal(topicLabel.mainProperty, "topic_title");
  assert.equal(topicLabel.sortProperty, "topic_title");
  assert.equal(topicLabel.title, "Topic");
  const computedTopicLabel = topicLabel.compute(row);
  assert.equal(
    computedTopicLabel.formatedValue,
    "<a href='/t/-/2'>Test topic</a>"
  );
  assert.equal(computedTopicLabel.type, "topic");
  assert.equal(computedTopicLabel.value, "Test topic");

  const postLabel = computedLabels[5];
  assert.equal(postLabel.mainProperty, "post_raw");
  assert.equal(postLabel.sortProperty, "post_raw");
  assert.equal(postLabel.title, "Post");
  const computedPostLabel = postLabel.compute(row);
  assert.equal(
    computedPostLabel.formatedValue,
    "<a href='/t/-/2/3'>This is the beginning of</a>"
  );
  assert.equal(computedPostLabel.type, "post");
  assert.equal(computedPostLabel.value, "This is the beginning of");
});
