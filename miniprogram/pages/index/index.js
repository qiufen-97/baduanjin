const STORAGE_KEY = 'bdj_records';
const pad = number => String(number).padStart(2, '0');
const dateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const encouragements = [
  '今天的身体，也被你好好照顾了。',
  '一点点舒展，也是一份认真。',
  '这一回，算进了日子里。',
  '不求满分，只记得回来。',
  '今天这一式，叫作坚持。',
  '练过便有痕迹，慢慢来。'
];

Page({
  data: {
    greeting: '',
    dateLabel: '',
    checked: false,
    celebrate: false,
    message: '练完以后，轻轻按一下',
    weekDays: [],
    total: 0,
    streak: 0
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const records = wx.getStorageSync(STORAGE_KEY) || {};
    const now = new Date();
    const todayKey = dateKey(now);
    const checked = Boolean(records[todayKey]);
    const hour = now.getHours();
    const greeting = hour < 11 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
    const weekday = '日一二三四五六'[now.getDay()];
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekDays = [];

    for (let index = 0; index < 7; index += 1) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const key = dateKey(day);
      weekDays.push({
        key,
        label: '一二三四五六日'[index],
        day: day.getDate(),
        checked: Boolean(records[key]),
        today: key === todayKey,
        future: day > now
      });
    }

    let streak = 0;
    const cursor = new Date(now);
    if (!checked) cursor.setDate(cursor.getDate() - 1);
    while (records[dateKey(cursor)]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    this.setData({
      greeting,
      dateLabel: `${now.getMonth() + 1}月${now.getDate()}日 · 星期${weekday}`,
      checked,
      weekDays,
      total: Object.keys(records).length,
      streak,
      message: checked ? this.completionMessage(Object.keys(records).length, streak) : '练完以后，轻轻按一下'
    });
  },

  completionMessage(total, streak) {
    if ([7, 21, 50, 100, 365].includes(total)) return `这是你的第 ${total} 次，真好。`;
    if (streak > 0 && streak % 7 === 0) return `不知不觉，已经连续 ${streak} 天。`;
    return encouragements[(total - 1) % encouragements.length];
  },

  checkIn() {
    if (this.data.checked) {
      wx.showToast({ title: '今天已经打过卡啦', icon: 'none' });
      return;
    }

    const records = wx.getStorageSync(STORAGE_KEY) || {};
    const now = new Date();
    const key = dateKey(now);
    records[key] = {
      date: key,
      type: 'complete',
      mode: 'checkin',
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
    };
    wx.setStorageSync(STORAGE_KEY, records);
    wx.vibrateShort({ type: 'light' });
    this.setData({ celebrate: false });
    this.refresh();
    this.setData({ celebrate: true });
    setTimeout(() => this.setData({ celebrate: false }), 1100);
  }
});
