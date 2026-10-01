const STORAGE_KEY = 'bdj_records';
const pad = value => String(value).padStart(2, '0');
const dateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

Page({
  data: {
    checked: false,
    celebrate: false,
    monthLabel: '',
    weekLabels: ['一', '二', '三', '四', '五', '六', '日'],
    monthDays: []
  },

  onLoad() { this.refresh(); },
  onShow() { this.refresh(); },

  refresh() {
    const records = wx.getStorageSync(STORAGE_KEY) || {};
    const now = new Date();
    this.setData({
      checked: Boolean(records[dateKey(now)]),
      monthLabel: `${now.getFullYear()} / ${pad(now.getMonth() + 1)}`,
      monthDays: this.buildMonth(now, records)
    });
  },

  buildMonth(now, records) {
    const year = now.getFullYear();
    const month = now.getMonth();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: leading }, (_, index) => ({ key: `empty-${index}`, empty: true }));
    for (let day = 1; day <= count; day += 1) {
      const key = `${year}-${pad(month + 1)}-${pad(day)}`;
      days.push({ key, day, checked: Boolean(records[key]), today: key === dateKey(now) });
    }
    return days;
  },

  checkIn() {
    if (this.data.checked) {
      wx.showToast({ title: '今日已打卡', icon: 'none' });
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
    this.setData({ checked: true, celebrate: true, monthDays: this.buildMonth(now, records) });
    setTimeout(() => this.setData({ celebrate: false }), 1000);
  },

  savePoster() {
    if (!this.data.checked) return;
    wx.showLoading({ title: '生成中', mask: true });
    this.drawPoster(path => {
      wx.hideLoading();
      if (!path) {
        wx.showToast({ title: '生成失败，请重试', icon: 'none' });
        return;
      }
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: error => {
          if (error.errMsg && error.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '需要相册权限',
              content: '请在设置中允许保存图片到相册。',
              confirmText: '去设置',
              success: result => { if (result.confirm) wx.openSetting(); }
            });
          } else {
            wx.showToast({ title: '保存失败，请重试', icon: 'none' });
          }
        }
      });
    });
  },

  drawPoster(done) {
    const ctx = wx.createCanvasContext('posterCanvas', this);
    const now = new Date();
    const records = wx.getStorageSync(STORAGE_KEY) || {};
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = (new Date(year, month, 1).getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();

    ctx.setFillStyle('#F3EFE6');
    ctx.fillRect(0, 0, 750, 1000);
    ctx.setStrokeStyle('#D8D0C2');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.arc(375, 320, 196, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(375, 320, 172, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setFillStyle('#29483C');
    ctx.beginPath();
    ctx.arc(375, 320, 146, 0, Math.PI * 2);
    ctx.fill();
    ctx.setFillStyle('#F7F3EA');
    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    ctx.setFontSize(112);
    ctx.fillText('✓', 375, 300);
    ctx.setFontSize(26);
    ctx.fillText('已 打 卡', 375, 385);
    ctx.setFillStyle('#26342E');
    ctx.setFontSize(26);
    ctx.fillText(`${year} / ${pad(month + 1)} / ${pad(now.getDate())}`, 375, 560);

    const labels = ['一', '二', '三', '四', '五', '六', '日'];
    const startX = 117;
    const stepX = 86;
    const startY = 650;
    ctx.setFontSize(19);
    ctx.setFillStyle('#8C928E');
    labels.forEach((label, index) => ctx.fillText(label, startX + index * stepX, startY));

    for (let day = 1; day <= count; day += 1) {
      const position = first + day - 1;
      const column = position % 7;
      const row = Math.floor(position / 7);
      const x = startX + column * stepX;
      const y = startY + 62 + row * 58;
      const key = `${year}-${pad(month + 1)}-${pad(day)}`;
      const checked = Boolean(records[key]);
      if (checked) {
        ctx.setFillStyle('#9D594E');
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.setFillStyle('#FFFFFF');
      } else {
        ctx.setFillStyle('#606A65');
      }
      ctx.setFontSize(18);
      ctx.fillText(String(day), x, y + 1);
    }

    ctx.setFillStyle('#A4A39E');
    ctx.setFontSize(18);
    ctx.fillText('八段锦日课', 375, 945);
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        width: 750,
        height: 1000,
        destWidth: 1500,
        destHeight: 2000,
        fileType: 'png',
        quality: 1,
        success: result => done(result.tempFilePath),
        fail: () => done('')
      }, this);
    });
  }
});
