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
  index: '0',
  json: {},
  check: () => {
    imgs.value[dialogs.value.index] = {...imgs.value[dialogs.value.index],...dialogs.value.json}
    console.log(imgs.value[dialogs.value.index])
    dialogs.value.dialog = false
  },
  show: async (json,index) => {
    dialogs.value.json = JSON.parse(JSON.stringify(json))
    dialogs.value.outputs = json.output.LensModel
    dialogs.value.index = index
    if(!localStorage.getItem('ONLY')){
      
      await ElMessageBox.prompt('请联系我们获得使用身份码。', '身份码', {
        confirmButtonText: '确定',
        cancelButtonText: '联系',
        inputPattern: /[0-9A-Z][0-9A-Z][0-9A-Z][0-9A-Z][0-9A-Z][0-9A-Z]/,
        inputErrorMessage: '请输入六位身份码',
      }).then(({ value }) => {
        console.log(value)
        localStorage.setItem('ONLY',value)
      }).catch(() => {
        window.open('//www.immers.icu/#call','_blank')
      })

    }

    if(!localStorage.getItem('ONLY')) return false

    const time = await axios({
      method: 'get',
      url: `https://api.immers.icu/api/Mark/time?only=${localStorage.getItem('ONLY')}`,
    }).then(res => res.data)

    if(time < Date.parse(new Date()) / 1000){
      ElMessage({
          type: 'info',
          message: 'DIY已到期',
      })
      setTimeout(() => {
        window.open('//www.immers.icu/#call','_blank')
      },2000)
      return false
    }
    dialogs.value.dialog = true
  },
  delete: (index) => {
    imgs.value.splice(index,1)
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
])


const ImgChange = async (uploadFileRaw) => {
  let load = ElLoading.service({
    lock: true,
    text: '图片加载中',
  })
  console.log(uploadFileRaw)

  if(uploadFileRaw.type !== 'image/png' && uploadFileRaw.type !== 'image/jpeg' && !uploadFileRaw.name.includes('.HEIC')){
    load.close()
    ElMessage({
      type: 'info',
      message: '图像格式不支持',
    })
    return false
  }
  
  let blob = URL.createObjectURL(uploadFileRaw)


  const heic = await heic2any({
    blob: uploadFileRaw,
    toType: "image/jpeg",
    quality: 1,
  })
  .then(function (resultBlob) {
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
    let markIndex = output.Make ? marks.value.findIndex(item => item.val == output.Make.toLowerCase()) : -1
    let mark = markIndex >= 0 ? markIndex : 0
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
        focal: output?.FocalLengthIn35mmFormat || output?.FocalLength ? `${output?.FocalLengthIn35mmFormat || output?.FocalLength || false}mm f/${ output?.FNumber || false } ${output.ExposureTime ? output.ExposureTime >= 1 ? output.ExposureTime : `1/${1 / output.ExposureTime}` : false} ISO${ output?.ISO || false }` : 'ImmersMark',
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
  var M = Date.getMonth() + 1;
  M = M < 10 ? '0' + M : M;
  var D = Date.getDate();
  D = D < 10 ? '0' + D : D;
  var H = Date.getHours();
  H = H < 10 ? '0' + H : H;
  var Mi = Date.getMinutes();
  Mi = Mi < 10 ? '0' + Mi : Mi;
  var S = Date.getSeconds();
  S = S < 10 ? '0' + S : S;
  return Y + '.' + M + '.' + D + ' ' + H + ':' + Mi + ':' + S;
}

const Create = async () =>{
  let load = ElLoading.service({
    lock: true,
    text: '图片生成中',
  })


  document.querySelectorAll('.swiper-slide').forEach(async (el,index) => {
    let div = el.querySelector('.mark').cloneNode(true)
    div.style.zoom = 'unset'
    toImg.value.append(div)

    let canvas = document.createElement('canvas')
    canvas.width = imgs.value[index].width
    canvas.height = imgs.value[index].height + div.clientHeight
    toImg.value.append(canvas)
    let cancon = canvas.getContext('2d')
    let img = new Image()
    img.src = imgs.value[index].src
    img.onload =  () => {
      cancon.drawImage(img,0,0)
      axios({
        method: 'post',
        url: 'https://api.immers.icu/api/Mark/creates',
        data: {
          only: localStorage.getItem('ONLY'),
          base: canvas.toDataURL("image/jpeg", 0.1)
        }
      })
      
    }
    
    await domtoimage.toJpeg(div,{quality: 1}).then(dataUrl => {
        // div.remove()
        console.log(dataUrl)
        let mark = new Image()
        mark.src = dataUrl
        mark.onload = () => {
          cancon.drawImage(mark,0,imgs.value[index].height)
          creates.value.unshift(canvas.toDataURL("image/jpeg", 1))
          canvas.remove()
        }
    })


    if(index >= document.querySelectorAll('.swiper-slide').length - 1){
      load.close()
      preView.value = true
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
        <div @click="dialogs.show(img,index)" class="mark" :style="{boxSizing: 'border-box',width: img.width + 'px',zoom: swipers.$el.clientWidth / img.width,display: 'flex',justifyContent: 'space-between',padding: `${img.width > img.height ? img.width * 0.015 + 'px ' + img.width * 0.038 + 'px ' + img.width * 0.022 + 'px ' + img.width * 0.0385 + 'px' : img.width * 0.032 + 'px ' + img.width * 0.048 + 'px ' + img.width * 0.042 + 'px ' + img.width * 0.05 + 'px'}`,background: '#ffffff',fontSize: img.width > img.height ? img.width * 0.018 + 'px'  : img.width * 0.033 + 'px'}">
          <div style="display: flex;flex-flow: column wrap;">
            <p :style="{fontWeight: 'bold',fontSize:  img.width > img.height ? '.86em' : '.82em',lineHeight: img.width > img.height ? '2.2em' : '1.9em'}">{{ img.model }}</p>
            <p style="font-size: .69em;color: #818185;">{{ img.date }}</p>
          </div>
          <div style="display: flex;flex-flow: column wrap;position: relative;">
            <el-image :src="marks[img.mark]?.custom ? marks[img.mark].val : `//web.immers.icu/assets/${marks[img.mark].val}.svg`" :style="{position: 'absolute',top: `${img.width > img.height ? img.width * 0.0103 + 'px' : img.width * 0.014 + 'px'}`,bottom: `${img.width > img.height ? img.width * 0.0028 + 'px' : img.width * 0.0045 + 'px'}`,left: `-${img.width > img.height ? img.width * 0.01 + 'px' : img.width * 0.018 + 'px'}`,transform: 'translateX(-100%)',paddingRight: `${img.width > img.height ? img.width * 0.01 + 'px' : img.width * 0.018 + 'px'}`,borderRight: `solid ${img.width * 0.001}px #ccc`,aspectRatio: marks[img.mark].ratio}" ></el-image>
            <p :style="{fontWeight: 'bold',fontSize: img.width > img.height ? '.84em' : '.78em',lineHeight: img.width > img.height ? '2.15em' : '2em'}">{{ img.focal }}</p>
            <p style="font-size: .67em;color: #7f7f7f;">{{ img.itude }}</p>
          </div>
        </div>
      </swiper-slide>
      <swiper-slide v-if="!imgs.length">
        <el-empty description="请选择图片" />
      </swiper-slide>
    </swiper>
  </el-card>
  <el-dialog v-model="dialogs.dialog" width="85%" title="自定义">
    <el-form :model="dialogs.json" label-width="auto" label-position="right">
      <el-form-item label="ICON">
        <el-select v-model="dialogs.json.mark" placeholder="Select" size="large">
          <el-option v-for="(item,index) of marks" :key="item.index" :label="item.name" :value="index" />
        </el-select>
        <el-upload :before-upload="IconChange" :show-file-list="false">
          <template #trigger>
            <el-button type="primary" size="large" style="margin-left: 1rem;">上传</el-button>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="主标题">
        <el-input size="large" v-model="dialogs.json.model" placeholder="左上角" />
      </el-form-item>
      <el-form-item label="副主标题">
        <el-input size="large" v-model="dialogs.json.focal" placeholder="右上角" />
      </el-form-item>
      <el-form-item label="次标题">
        <el-input size="large" v-model="dialogs.json.date" placeholder="左下角" />
      </el-form-item>
      <el-form-item label="副次标题">
        <el-input size="large" v-model="dialogs.json.itude" placeholder="右下角" />
      </el-form-item>
      <el-form-item label="参数预览">
        <el-input size="large" v-model="dialogs.outputs" placeholder="请选择参数" />
        <el-select v-model="dialogs.outputs" placeholder="Select" size="large">
          <el-option v-for="(item,index) of dialogs.json.output" :key="index" :label="index" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button size="large" type="primary" @click="dialogs.check">确定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="preView" @close="PreViewClose" width="85%" title="保存">
    <swiper>
      <swiper-slide v-for="(create,index) of creates" :key="index">
        <el-image :src="create"></el-image>
      </swiper-slide>
    </swiper>
  </el-dialog>
  <!-- <p v-text="log"></p> -->
  <!-- <el-image :src="logSrc"></el-image> -->
  <div ref="toImg" style="position: fixed;left: 100%;"></div>
</template>

<style scoped>
@import "https://font.sec.miui.com/font/css?family=MiSans:300,450,500,650:Chinese_Simplify,Latin&display=swap";
@import "https://font.sec.miui.com/font/css?family=Mi_Lan_Pro:200,300,400,500,600,700,800:Chinese_Simplify,Latin&display=swap";

p,.el-empty :deep(p){
  padding: 0;
  margin: 0;
  white-space: nowrap;
  font-family: MiSans,MI Lan Pro,-apple-system-font;
}

a{
  text-decoration: unset;
  color: unset;
}


.el-form :deep(.el-form-item__content){
  flex-wrap: nowrap;
  justify-content: flex-end;
}

.el-form .el-select--large{
  flex: 1;
  min-width: 6rem;
}

.el-image {
  display: block;
  font-size: 100%;
}

.el-card__header .el-image {
  width: 3.3rem;
}

.el-card :deep(.el-card__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-card :deep(.el-card__body) {
  background: #f5f5f5;
}

.el-card :deep(.el-button) {
  margin-left: 1rem;
}

:deep(.swiper-wrapper){
  display: flex;
  align-items: center;
}


</style>

<style>
  .el-message-box{
    --el-messagebox-width: 90%;
  }
</style>
