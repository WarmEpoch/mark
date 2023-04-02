<template>
    <RouterView></RouterView>
</template>
<style>
  @import "https://font.sec.miui.com/font/css?family=MiSans:300,450,500,650:Chinese_Simplify,Latin&display=swap";
  @import "https://font.sec.miui.com/font/css?family=Mi_Lan_Pro:200,300,400,500,600,700,800:Chinese_Simplify,Latin&display=swap";

  body{
    margin: 0;
  }

  p,.el-empty p{
    padding: 0;
    margin: 0;
    white-space: nowrap;
    font-family: MiSans,MI Lan Pro,-apple-system,-apple-system-font;
  }
  
  a{
    text-decoration: unset;
    color: unset;
  }
  
  
  .el-form .el-form-item__content{
    flex-wrap: nowrap;
    justify-content: flex-end;
  }
  
  .el-form .el-select--large{
    flex: 1;
    min-width: 4.3rem;
  }
  
  .el-image {
    display: block;
    font-size: 100%;
  }

  .el-card{
    border: none;
    border-radius: 0;
  }
  
  .el-card__header .el-image {
    width: 3.3rem;
  }
  
  .el-card .el-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
  }
  
  .el-card .el-card__body {
    padding: 0;
  }
  
  .el-card .el-button {
    margin-left: 1rem;
  }

  .el-message-box{
    --el-messagebox-width: 90%;
  }
  .el-message--success{
    z-index: 9999!important;
  }

  .create{
    background: #f5f5f5;
  }
  .create .el-dialog__header{
    background: #fff;
    margin-right: unset;
    padding-bottom: var(--el-dialog-padding-primary);
  }
  .create .el-dialog__body{
    background: #f5f5f5;
    text-align: right;
    font-size: .8rem;
  }
  #toImg{
    position: fixed;
    right: 100%;
  }
  #toImg canvas{
    width: 100%;
  }
  .swiper-wrapper{
    font-size: 0;
  }

  ::-webkit-scrollbar{
    display: none;
  }
</style>