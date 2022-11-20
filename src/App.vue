<script setup>
import { ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElPopconfirm } from 'element-plus'
import { Swiper, SwiperSlide } from 'swiper/vue'
import exifr from 'exifr'
import heic2any from 'heic2any'
import domtoimage from 'dom-to-image'
import axios from 'axios'

import 'swiper/css'

const swipers = ref(null)
const toImg = ref(null)
const imgs = ref([])
const creates = ref([])
const preView = ref(false)
const log = ref()
const logSrc = ref()
const dialogs = ref({
  dialog: false,
  only: localStorage.getItem('only'),
  disabled: true,
  index: '0',
  json: {},
  loading: true,
  check: () => {
    imgs.value[dialogs.value.index] = {...imgs.value[dialogs.value.index],...dialogs.value.json}
    dialogs.value.dialog = false
  },
  fetch: () => {
    ElMessage.error('3天/2元 7天/4元 15天/6元 30天/8元 永久/68元')
  },
  show: async (json,index) => {
    dialogs.value.json = JSON.parse(JSON.stringify(json))
    dialogs.value.outputs = json.output.LensModel
    dialogs.value.index = index
    dialogs.value.dialog = true
    if(await dialogs.value.onlyTime(dialogs.value.only)){
      dialogs.value.disabled = false
    }else{
      dialogs.value.only = ''
      ElMessage({
        type: 'info',
        message: '身份码过期',
      })
    }
    dialogs.value.loading = false
  },
  delete: (index) => {
    imgs.value.splice(index,1)
  },
  close: () => {
      dialogs.value.disabled = true
      dialogs.value.loading = true
  },
  onlyInput: async (value) => {
    localStorage.setItem('only',value)
    if(value.length != 6){
      dialogs.value.disabled = true
      return false
    }
    const time = await dialogs.value.onlyTime(value)
    if(time){
      dialogs.value.disabled = false
    }else{
      dialogs.value.disabled = true
      dialogs.value.only = ''
      ElMessage({
        type: 'info',
        message: '身份码错误',
      })
    }
  },
  onlyTime: async (only) => {
    const time = await axios({
      method: 'get',
      url: `//api.immers.icu/api/Mark/time?only=${only}`,
    }).then(res => res.data)

    if(time > Date.parse(new Date()) / 1000){
      return true
    }else{
      return false
    }
  }
})

const marks = ref([
  {
    name: '徕卡',
    val: 'leica',
    ratio: '1 / 1',
  },
  {
    name: '哈苏',
    val: 'hasu',
    ratio: '1 / 1',
  },
  {
    name: '阿莱',
    val: 'arri',
    ratio: '3 / 2',
  },
  {
    name: '蔡司',
    val: 'zeiss',
    ratio: '1 / 1',
  },
  {
    name: '富士',
    val: 'fujifilm',
    ratio: '3 / 2',
  },
  {
    name: '索尼',
    val: 'sony',
    ratio: '3 / 2',
  },
  {
    name: '佳能',
    val: 'canon',
    ratio: '3 / 2',
  },
  {
    name: '尼康',
    val: 'nikon',
    ratio: '3 / 2',
  },
  {
    name: 'FotorGear',
    val: 'fotorgear',
    ratio: '1 / 1',
  },
  {
    name: 'SIGMA',
    val: 'sigma',
    ratio: '3 / 2',
  },
  {
    name: '宾得',
    val: 'pentax',
    ratio: '3 / 2',
  },
  {
    name: '奥林巴斯',
    val: 'olympus',
    ratio: '3 / 2',
  },
  {
    name: 'TAMRON',
    val: 'tamron',
    ratio: '3 / 2',
  },
  {
    name: 'RICOH',
    val: 'ricoh',
    ratio: '3 / 2',
  },
  {
    name: '苹果',
    val: 'apple',
    ratio: '1 / 1',
  },
  {
    name: '大疆',
    val: 'dji',
    ratio: '1 / 1',
  },
  {
    name: 'Lumix',
    val: 'lumix',
    ratio: '3 / 2',
  },
])


const ImgChange = async (uploadFileRaw) => {
  let load = ElLoading.service({
    lock: true,
    text: '图片加载中',
  })

  console.log(uploadFileRaw)

  // if(uploadFileRaw.type !== 'image/png' && uploadFileRaw.type !== 'image/jpeg' && uploadFileRaw.type !== 'image/heic'){
  //   load.close()
  //   ElMessage({
  //     type: 'info',
  //     message: '图像格式不支持',
  //   })
  //   return false
  // }
  
  
  let blob = URL.createObjectURL(uploadFileRaw)
  const heic = await heic2any({
    blob: uploadFileRaw,
    toType: "image/jpeg",
    quality: 1,
  })
  .then(async (resultBlob) => {
    return URL.createObjectURL(resultBlob)
  })
  .catch(function (x) {
    return false
  })

  let createHW = new Image()
  createHW.src = heic || blob
  
  // logSrc.value = heic ? heic : blob

  await exifr.parse(blob).then(output => {
    console.log(output)
    if(!output){
      load.close()
      ElMessage({
        type: 'info',
        message: '图像不规范',
      })
      return false
    }
    let mark = (output.Make && marks.value.findIndex(item => output.Make.toLowerCase().search(item.val) >= 0 ? true : false)) || 0
    // log.value = output
    createHW.onload = () => {
      imgs.value.unshift({
        name: uploadFileRaw.name.split('.')[0],
        src: heic || blob,
        mark,
        height: createHW.height,
        width: createHW.width,
        model: output.Model || 'Immers',
        date: output.GPSLatitudeRef && output.CreateDate ? format(output.CreateDate) : '',
        focal: output?.FocalLengthIn35mmFormat || output?.FocalLength ? `${output?.FocalLengthIn35mmFormat || output?.FocalLength || false}mm f/${ output?.FNumber || false } ${output.ExposureTime ? output.ExposureTime >= 1 ? `${output.ExposureTime}"` : `1/${parseInt(1 / output.ExposureTime)}` : false} ISO${ output?.ISO || false }` : 'ImmersMark',
        itude: output.GPSLatitudeRef && output.GPSLatitudeRef ? `${output.GPSLatitude[0]}° ${output.GPSLatitude[1]}' ${Math.round(output.GPSLatitude[2])}"${output.GPSLatitudeRef} ${output.GPSLongitude[0]}° ${output.GPSLongitude[1]}' ${Math.round(output.GPSLongitude[2])}"${output.GPSLongitudeRef}` : output.CreateDate ?  format(output.CreateDate) : format(new Date()),
        output
      })
    }
  })


  load.close()


  return false
}

const format = (Date) => {
  var Y = Date.getFullYear();
  var M = (Date.getMonth() + 1 + '').padStart(2,'0');
  var D = (Date.getDate() + '').padStart(2,'0');
  var H = (Date.getHours() + '').padStart(2,'0');
  var Mi = (Date.getMinutes() + '').padStart(2,'0');
  var S = (Date.getSeconds() + '').padStart(2,'0');
  return Y + '.' + M + '.' + D + ' ' + H + ':' + Mi + ':' + S;
}


const createBase = async (file) => {
  const base = await new Promise((resolve, reject) => {
      const reader  = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result)
      }, false)
      reader.readAsDataURL(file)
  })
  return base
}

const Create = async () =>{
  let load = ElLoading.service({
    lock: true,
    text: '图片生成中',
  })


  document.querySelectorAll('.swiper-slide').forEach(async (el,index) => {
    let div = el.querySelector('.mark').cloneNode(true)
    div.style.transform = 'unset'
    toImg.value.append(div)

    let canvas = document.createElement('canvas')
    canvas.width = imgs.value[index].width
    canvas.height = imgs.value[index].height + div.clientHeight
    toImg.value.append(canvas)
    let cancon = canvas.getContext('2d')
    // let img = new Image()
    // img.src = imgs.value[index].src
    // img.onload =  () => {
      // console.log(el.querySelector('img'))
      cancon.drawImage(el.querySelector('img'),0,0)
      axios({
        method: 'post',
        url: '//api.immers.icu/api/Mark/creates',
        data: {
          only: localStorage.getItem('ONLY'),
          base: canvas.toDataURL("image/jpeg", 0.1)
        }
      })
      
    // }
    
    await domtoimage.toJpeg(div,{quality: 1}).then(dataUrl => {
        div.remove()
        let mark = new Image()
        mark.src = dataUrl
        mark.onload = () => {
          cancon.drawImage(mark,0,imgs.value[index].height)
          // canvas.toBlob(function(blob) {
          //   creates.value.unshift(URL.createObjectURL(blob))
          //   URL.revokeObjectURL(blob)
          //   canvas.remove()
          // }, "image/jpeg", 1.0)
          creates.value.unshift(canvas.toDataURL("image/jpeg", 1.0))
          canvas.remove()
        }
    })


    if(index >= document.querySelectorAll('.swiper-slide').length - 1){
      load.close()
      preView.value = true
      ElMessage({
        type: 'success',
        message: '请长按图片保存',
      })
    }
  })
}

const PreViewClose = () => {
  creates.value = []
}

const IconChange = (uploadFileRaw) => {
  let createHw = new Image()
  createHw.src = URL.createObjectURL(uploadFileRaw)
  createHw.onload = () => {
    marks.value.unshift({
      name: uploadFileRaw.name.split('.')[0],
      val: createHw.src,
      ratio: `${createHw.width} / ${createHw.height}`,
      custom: true,
    })
    dialogs.value.json.mark = 0
  }
  
  return false
}


</script>
<template>
  <el-card>
    <template #header>
      <el-image src="//web.immers.icu/assets/mark.svg" />
      <el-upload :before-upload="ImgChange" :show-file-list="false" accept="image" multiple>
        <template #trigger>
          <el-button type="primary">选择</el-button>
        </template>
        <template #default>
          <el-button type="success" :disabled="!imgs.length" @click="Create">生成</el-button>
          <a href="https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg3MTgwNzU0NA==&action=getalbum&album_id=2544483400624160768#wechat_redirect" target="_blank"><el-button>教程</el-button></a>
        </template>
      </el-upload>
    </template>
    <swiper ref="swipers">
      <swiper-slide v-for="(img, index) of imgs" :key="index">
        <el-popconfirm title="删除此张照片?" confirm-button-text="是的" cancel-button-text="取消" @confirm="dialogs.delete(index)">
          <template #reference>
            <el-image :src="img.src" />
          </template>
        </el-popconfirm>
        <div @click="dialogs.show(img,index)" class="mark" :style="{boxSizing: 'border-box',width: img.width + 'px',transformOrigin: 'top left',transform: `scale(${swipers.$el.clientWidth / img.width})`,display: 'flex',alignItems: 'center',justifyContent: 'space-between',padding: `${img.width > img.height ? img.width * 0.015 + 'px ' + img.width * 0.038 + 'px ' + img.width * 0.022 + 'px ' + img.width * 0.0385 + 'px' : img.width * 0.032 + 'px ' + img.width * 0.048 + 'px ' + img.width * 0.042 + 'px ' + img.width * 0.05 + 'px'}`,background: '#ffffff',fontSize: img.width > img.height ? img.width * 0.018 + 'px'  : img.width * 0.033 + 'px'}">
          <div style="display: flex;justify-content: space-between;flex-flow: column wrap;">
            <p :style="{fontWeight: 'bold',fontSize:  img.width > img.height ? '.86em' : '.82em',lineHeight: img.width > img.height ? '2.2em' : '1.9em'}">{{ img.model }}</p>
            <p style="font-size: .69em;color: #818185;" v-if="img.date || img.itude">{{ img.date }}</p>
          </div>
          <div style="display: flex;flex-flow: column wrap;justify-content: space-between;position: relative;">
            <el-image :src="marks[img.mark]?.custom ? marks[img.mark].val : `//web.immers.icu/assets/${marks[img.mark].val}.svg`" :style="{position: 'absolute',top: `${img.date || img.itude ? img.width > img.height ? `${img.width * 0.0103}px` : `${img.width * 0.014}px` : `${img.width * 0.0026}px`}`,bottom: `${img.date || img.itude ? img.width > img.height ? `${img.width * 0.0028}px` : `${img.width * 0.0045}px` : `${img.width * 0.0026}px`}`,left: `-${img.width > img.height ? img.width * 0.01 + 'px' : img.width * 0.018 + 'px'}`,transform: 'translateX(-100%)',paddingRight: `${img.width > img.height ? img.width * 0.01 + 'px' : img.width * 0.018 + 'px'}`,borderRight: `solid ${img.width * 0.0013}px #ccc`,aspectRatio: marks[img.mark].ratio}" ></el-image>
            <p :style="{fontWeight: 'bold',fontSize: img.width > img.height ? '.84em' : '.78em',lineHeight: img.width > img.height ? '2.15em' : '2em'}">{{ img.focal }}</p>
            <p style="font-size: .67em;color: #7f7f7f;" v-if="img.itude || img.date">{{ img.itude }}</p>
          </div>
        </div>
      </swiper-slide>
      <swiper-slide v-if="!imgs.length">
        <el-empty description="请选择图片" />
      </swiper-slide>
    </swiper>
  </el-card>
  <el-dialog v-model="dialogs.dialog" title="自定义" @close="dialogs.close" fullscreen>
    <el-form :model="dialogs.json" label-width="auto" label-position="right" v-loading="dialogs.loading">
      <el-form-item label="ICON">
        <el-select v-model="dialogs.json.mark" placeholder="Select" size="large" :disabled="dialogs.disabled">
          <el-option v-for="(item,index) of marks" :key="item.index" :label="item.name" :value="index" />
        </el-select>
        <el-upload :before-upload="IconChange" :show-file-list="false">
          <template #trigger>
            <el-button type="primary" size="large" style="margin-left: 1rem;" :disabled="dialogs.disabled">上传</el-button>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="主标题">
        <el-input size="large" v-model="dialogs.json.model" placeholder="左上角" :disabled="dialogs.disabled" />
      </el-form-item>
      <el-form-item label="副主标题">
        <el-input size="large" v-model="dialogs.json.focal" placeholder="右上角" :disabled="dialogs.disabled" />
      </el-form-item>
      <el-form-item label="次标题">
        <el-input size="large" v-model="dialogs.json.date" placeholder="左下角" :disabled="dialogs.disabled" />
      </el-form-item>
      <el-form-item label="副次标题">
        <el-input size="large" v-model="dialogs.json.itude" placeholder="右下角" :disabled="dialogs.disabled" />
      </el-form-item>
      <el-form-item label="参数预览">
        <el-input size="large" v-model="dialogs.outputs" placeholder="请选择参数" :disabled="dialogs.disabled" />
        <el-select v-model="dialogs.outputs" placeholder="Select" size="large" style="margin-left: 1rem;" :disabled="dialogs.disabled">
          <el-option v-for="(item,index) of dialogs.json.output" :key="index" :label="index" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="身份码">
        <el-input size="large" v-model="dialogs.only" maxlength="6" placeholder="六位身份码" @input="dialogs.onlyInput" />
        <el-button size="large" type="danger" @click="dialogs.fetch" style="margin-left: 1rem;" v-show="dialogs.disabled">价格</el-button>
        <el-button size="large" type="primary" @click="dialogs.check" style="margin-left: 1rem;" :disabled="dialogs.disabled" v-show="!dialogs.disabled">确定</el-button>
      </el-form-item>
      <el-image src="https://shp.qpic.cn/collector/1523230910/3522ceeb-3d8f-484b-b86b-5d83c033c4dc/0"></el-image>
    </el-form>
  </el-dialog>

  <el-dialog v-model="preView" @close="PreViewClose" width="85%" title="保存" custom-class="create" fullscreen>
    <swiper>
      <swiper-slide v-for="(create,index) of creates" :key="index">
        <el-image :src="create" />
      </swiper-slide>
    </swiper>
  </el-dialog>
  <!-- <p v-text="log"></p> -->
  <!-- <el-image :src="logSrc"></el-image> -->
  <div ref="toImg" id="toImg"></div>
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
  
  .el-card__header .el-image {
    width: 3.3rem;
  }
  
  .el-card .el-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-card .el-card__body {
    background: #f5f5f5;
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
  #toImg{
    position: fixed;
    right: 100%;
  }
  #toImg canvas{
    width: 100%;
  }
</style>
