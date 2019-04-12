// pages/wuziqi/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {

    viewWidth:300,
    // 每个格子的长度
    geLength:10,

    // 棋盘线条数
    geNum:13,

    // 棋子占棋盘的比例
    ratio:0.75,

    // 白子数组
    whiteArray: [],

    // 黑子数组
    blackArray: [],

    // 是否是白字下
    isWhite:true,

    textShow:'白子下',

    // 游戏是否结束
    isGameOver:false,

    // 五子连珠
    MAX_PIECE_NUM:5
  },

  // 初始化数据
  init:function(){
    var ctx = wx.createCanvasContext('customCanvas');
    this.drawBoard(ctx);
    this.drawPieces(ctx);
    ctx.draw();
    this.checkGameIsOver();
  },

  // 绘制棋盘
  drawBoard: function (ctx){
    ctx.setLineWidth(1);
    ctx.setStrokeStyle("#000000");
    for(let i=0;i<this.data.geNum;i++){
      ctx.moveTo((0.5 + i) * this.data.geLength,(0.5)*this.data.geLength);
      ctx.lineTo((0.5 + i) * this.data.geLength, this.data.viewWidth-(0.5) * this.data.geLength);
      ctx.moveTo((0.5) * this.data.geLength, (0.5 + i) * this.data.geLength);
      ctx.lineTo(this.data.viewWidth-(0.5) * this.data.geLength, (0.5 + i ) * this.data.geLength);
      ctx.stroke();
    }
  },

  // 绘制棋子
  drawPieces: function (ctx){
    const blackPiece = '../../images/stone_b1.png';
    const whitePiece = '../../images/stone_w2.png';
    for(let i=0;i<this.data.whiteArray.length;i++){
      let point = this.data.whiteArray[i];
      ctx.drawImage(whitePiece, (point.x + (1 - this.data.ratio)/2) * this.data.geLength, (point.y + (1 - this.data.ratio)/2) * this.data.geLength, this.data.geLength * this.data.ratio, this.data.geLength * this.data.ratio);
    }

    for (let i = 0; i < this.data.blackArray.length; i++) {
      let point = this.data.blackArray[i];
      ctx.drawImage(blackPiece, (point.x + (1 - this.data.ratio)/2) * this.data.geLength, (point.y + (1 - this.data.ratio)/2) * this.data.geLength, this.data.geLength * this.data.ratio, this.data.geLength * this.data.ratio);
    }
  },

  touchStart:function(e){
  },

  touchMove:function(e){
  },

  touchEnd:function(e){
    if(this.data.isGameOver){
      return false;
    }
    const mPoint = this.getValidPoint(e.changedTouches[0]);
    if (this.isHasPoint(mPoint, this.data.whiteArray) || this.isHasPoint(mPoint, this.data.blackArray)){
      return false;
    }
    if (this.data.isWhite){
       this.data.whiteArray.push(mPoint);
    }else{
       this.data.blackArray.push(mPoint);
    }
    this.setShowTextViewString();
    this.init();
  },

  // 设置显示文字
  setShowTextViewString:function(){
    this.data.isWhite = !this.data.isWhite;
    this.setData({
      textShow: this.data.isWhite ? '白子下' : '黑子下'
    });
  },

  // 重新开始
  reStart:function(){
    this.data.whiteArray.splice(0, this.data.whiteArray.length);
    this.data.blackArray.splice(0, this.data.blackArray.length);
    this.init();
    this.setData({
      textShow: this.data.isWhite ? '白子下' : '黑子下'
    });
  },

  // 悔棋一步
  backStep:function(){
    if (this.data.whiteArray.length > 0 || this.data.blackArray.length>0){
        if(this.data.isWhite){
          this.data.blackArray.pop();
        }else{
          this.data.whiteArray.pop();
        }
        this.setShowTextViewString();
        this.init();
    }else{
      // wx.showModal({
      //   title: '不能再悔棋啦！',
      //   content: '哈哈！',
      // });
      wx.showToast({
        title: '不能再悔棋啦！',
      })
    }
  },

  // 处理触摸点
  getValidPoint:function(point){
    let x = Math.floor(point.x / this.data.geLength);
    let y = Math.floor(point.y / this.data.geLength);
    return {
      x:x,
      y:y
    }
  },

  // 判断是否包含某个点
  isHasPoint:function(point,mArray){
    return JSON.stringify(mArray).indexOf(JSON.stringify(point)) != -1;
  },

  // 检查游戏是否胜利
  checkGameIsOver:function(){
    const blackWin = this.isWiner(this.data.blackArray);
    const whiteWin = this.isWiner(this.data.whiteArray);
    if(blackWin){
      this.data.isGameOver = true;
      this.setData({
        textShow: '黑棋胜利！'
      });
      // wx.showModal({
      //   title: '黑棋胜利',
      //   content: '哈哈！',
      // });
      wx.showToast({
        title: '黑棋胜利',
      });
    }else if(whiteWin){
      this.data.isGameOver = true;
      this.setData({
        textShow: '白棋胜利！'
      });
      // wx.showModal({
      //   title: '白棋胜利',
      //   content: '哈哈！',
      // });
      wx.showToast({
        title: '白棋胜利',
      });
    }else{
      this.data.isGameOver = false;
    }
  },

 // 检测是否胜利的算法
 isWiner:function(pieceArray){
   for(let i=0;i<pieceArray.length;i++){
     let x = pieceArray[i].x;
     let y = pieceArray[i].y;
     if (this.check(x, y, pieceArray, 0) || this.check(x, y, pieceArray, 1) || this.check(x, y, pieceArray, 2) || this.check(x, y, pieceArray, 3)){
        return true;
      }
   }
   return false;
 },

 // 检查每个方向
 check:function(x,y,points,type){
    let point1;
    let point2;
    let count = 1;
    for (let i = 1; i < this.data.MAX_PIECE_NUM; i++) {
      switch (type) {
        case 0:
          point1 = {x:x - i, y:y};
          break;
        case 1:
          point1 = {x:x, y:y - i};
          break;
        case 2:
          point1 = {x:x - i, y:y + i};
          break;
        case 3:
          point1 = {x:x + i, y:y + i};
          break;
      }
      if (this.isHasPoint(point1,points)) {
        count++;
      } else {
        break;
      }
    }  

   for (let i = 1; i < this.data.MAX_PIECE_NUM; i++) {
        switch (type) {
          case 0:
            point2 = {x:x + i, y:y};
            break;
          case 1:
            point2 = {x:x, y:y + i};
            break;
          case 2:
            point2 = {x:x + i, y:y - i};
            break;
          case 3:
            point2 = {x:x - i, y:y - i};
            break;
        }
      if (this.isHasPoint(point2, points)) {
          count++;
        } else {
          break;
        }
    }

   if (count == this.data.MAX_PIECE_NUM) {
      return true;
    }
    return false;
 },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      //获取系统信息成功，将系统窗口的宽高赋给页面的宽高  
      success: function (res) {
         that.setData({
           viewWidth:res.windowWidth-40,
           geLength: (res.windowWidth - 40)/that.data.geNum
         }); 
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})