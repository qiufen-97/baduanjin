App({
  globalData: {
    env: 'cloud1-d0gbwtx3sc132b73f',
    videoFileID: 'cloud://cloud1-d0gbwtx3sc132b73f.636c-cloud1-d0gbwtx3sc132b73f-1471073262/videos/badaunjin.mp4',
    audioFileID: 'cloud://cloud1-d0gbwtx3sc132b73f.636c-cloud1-d0gbwtx3sc132b73f-1471073262/audio/badaunjin.mp3'
  },
  onLaunch() {
    if (!wx.cloud) return console.error('基础库版本过低，无法使用云开发');
    wx.cloud.init({ env: this.globalData.env || undefined, traceUser: true });
  }
});
