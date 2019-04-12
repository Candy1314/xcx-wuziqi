# xcx-wuziqi
小程序--人人五子棋

   继上次实现android版人人五子棋后，发现分享给别人很麻烦，还需安装。所以想试试小程序，今天思考一番，用时3小时，实现此小程序。 特写此文章，分享给游有用的同学，欢迎关注，点赞，评论。

# 话不多说，先看效果图

![胜利效果图.png](https://upload-images.jianshu.io/upload_images/13222032-bb0216b6c35eb68c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![悔棋效果图.jpeg](https://upload-images.jianshu.io/upload_images/13222032-968a53b0c3981395.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 思路分析，几点问题

1.需要采用小程序canvas来绘制棋盘和棋子。

2.捕捉canvas的触摸事件，来保存触摸点到黑棋或者白棋数组，然后重新绘制canvas。

3.胜利算法判断，判断四个方向即（横向，纵向，左下，右下）是否满足五子连珠。

4.重新开始功能，需要清空所有棋子数组，然后绘制棋盘。

5.悔棋一步功能，remove上一步黑子数组或者白子数组的最后一个，然后绘制棋盘。

# 话不多说，直接撸代码

**1.wxml文件**
```
<!--pages/wuziqi/index.wxml-->
<view class="wuziqi-container" >
  <canvas canvas-id='customCanvas' class="customCanvas" style="width:{{viewWidth}}px;height:{{viewWidth}}px" bindtouchstart="touchStart" bindtouchmove="touchMove" bindtouchend="touchEnd" ></canvas>
  <view class="buttom-view" >
    <text style="color:white" >{{textShow}}</text>
  </view>
  <view class="buttom-action-view">
    <view class="action-view-left" bindtap='reStart'>
      <text style="color:white" >重新开始</text>
    </view>
    <view class="action-view-right" bindtap='backStep'>
      <text style="color:white" >悔棋一步</text>
    </view>
  </view>
</view>

```
可以看到，一个canvas来绘制棋盘，一个提示文字，两个操作按钮。

**2.wxss文件**
```
/* pages/wuziqi/index.wxss */

.customCanvas{
  background-color: #9797f5;
  margin-top: 20px;
  opacity: 0.8;
}
.buttom-view{
  width:110px;
  height:30px;
  background-color: rgba(255, 0, 0, 0.4);
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.buttom-action-view{
  width: 100%;
  height:35px;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
}
.action-view-left{
  display: flex;
  flex:1;
  background-color: black;
  margin-right: 10px;
  margin-left: 20px;
  justify-content: center;
  align-items: center;
  opacity: 0.7;
  border-radius: 2px;
}
.action-view-right{
  display: flex;
  flex:1;
  background-color: black;
  margin-right: 20px;
  margin-left: 10px;
  justify-content: center;
  align-items: center;
  opacity: 0.7;
  border-radius: 2px;
}
.wuziqi-container{
  width:100%;
  height:100%;
  position:fixed;
  display: flex;
  align-items: center;
  flex-direction: column;
  background-size:100% 100%;
  -moz-background-size:100% 100%;
  background-image:url("data:image/png;base64,/9j/4KKKKBhRRRTQmFFFFMkMmlyaSikxM//9k=");
}
```
背景图生成的base64码太长，所以去掉，大家可自行设置

**3.初始化页面数据**
```
/**
   * 页面的初始数据
   */
  data: {

    // 棋盘的默认宽度    
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

    // 提示文字    
    textShow:'白子下',

    // 游戏是否结束
    isGameOver:false,

    // 五子连珠
    MAX_PIECE_NUM:5
  },
```
**4.页面初始化时，重新设置棋盘宽高，以及每个格子的宽度**
```
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
```
**5.初始化棋盘和棋子**
```
// 初始化数据
  init:function(){
    var ctx = wx.createCanvasContext('customCanvas');
    // 绘制棋盘
    this.drawBoard(ctx);

   // 绘制棋子
    this.drawPieces(ctx);

   // 绘制
    ctx.draw();

   //检测是否胜利
    this.checkGameIsOver();
  },
```
**6.绘制棋盘**
```
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
```
考虑到边线也要下棋，故隔半个格子即（0.5*geLength）开始绘制。

**7.绘制棋子**
```
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
```
按触摸时保存的棋子数组，进行绘制。设置棋子宽度为格子的3/4，故如（0，0）点，绘制起点应该是（1-3/4）/2，因为要居中，所以应是1/8处。

**8.触摸棋盘**
```
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
```
首先判断游戏是否结束，如果结束，则触摸无效；

然后通过this. getValidPoint()方法格式话触摸点，得到的点，进行数组重复判断，如果白棋或者黑子数组有该点，则触摸无效；

判断当前是否是白子下，如果是，将此点保存在白子数组；否则保存在黑子数组，然后去更改提示文字和是否是白子下；

最后一步，重新绘制棋盘和棋子canvas；

**9.格式化触摸点**
```
// 格式化触摸点
  getValidPoint:function(point){
    let x = Math.floor(point.x / this.data.geLength);
    let y = Math.floor(point.y / this.data.geLength);
    return {
      x:x,
      y:y
    }
  },
```
拿到触摸点，除以格子长度，进行向下取整，保存结果。

**10.判断是否包含某个点**
```
// 判断是否包含某个点
  isHasPoint:function(point,mArray){
    return JSON.stringify(mArray).indexOf(JSON.stringify(point)) != -1;
  },
```

**11.设置显示的文字和更改是否是白子下**
```
// 设置显示文字
  setShowTextViewString:function(){
    this.data.isWhite = !this.data.isWhite;
    this.setData({
      textShow: this.data.isWhite ? '白子下' : '黑子下'
    });
  },
```
**12.检查游戏是否胜利**
```
// 检查游戏是否胜利
  checkGameIsOver:function(){
    const blackWin = this.isWiner(this.data.blackArray);
    const whiteWin = this.isWiner(this.data.whiteArray);
    if(blackWin){
      this.data.isGameOver = true;
      this.setData({
        textShow: '黑棋胜利！'
      });
     
     wx.showToast({
        title: '黑棋胜利',
      });
    }else if(whiteWin){
      this.data.isGameOver = true;
      this.setData({
        textShow: '白棋胜利！'
      });
     
      wx.showToast({
        title: '白棋胜利',
      });
    }else{
      this.data.isGameOver = false;
    }
  },
```

**13.检测是否胜利的算法**
```
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
```
**14.检查四个方向**
```
// 检查四个方向
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

```
拿到一个点，进行一个方向四次连续循环比较，看是数组中是否都包含，然后进行反方向比较，看两个方向加起来是否满足连续五子，如果是则五子连珠，游戏结束。

**15.重新开始**
```
// 重新开始
  reStart:function(){
    this.data.whiteArray.splice(0, this.data.whiteArray.length);
    this.data.blackArray.splice(0, this.data.blackArray.length);
    this.init();
    this.setData({
      textShow: this.data.isWhite ? '白子下' : '黑子下'
    });
  },
```
清空所有数组，重新绘制棋盘。

**16.悔棋一步**
```
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
        wx.showToast({
        title: '不能再悔棋啦！',
      })
    }
  },
```
首先判断黑棋数组和白棋数组是否为空，为空则不能再悔棋；否则判断上一次是白子下还是黑子下，移除数组最后一位，重新绘制棋盘和初始化提示文字。

#结束语
终于写完了，写代码3小时，写文章两小时，走过路过，欢迎点赞，留言批评指正。
