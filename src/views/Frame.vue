<script setup>
import { ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElPopconfirm } from 'element-plus'
import { Swiper, SwiperSlide } from 'swiper/vue'
import exifr from 'exifr'
import heic2any from 'heic2any'
import domtoimage from 'dom-to-image'
import axios from 'axios'
import Menu from '../components/menu.vue'
import Tips from '../components/tips.vue'

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
  only: localStorage.getItem('only') || false,
  disabled: true,
  password: false,
  index: '0',
  input: '',
  json: {
    mainTitle: 'Model',
  },
  customs: JSON.parse(localStorage.getItem('customs')) || [],
  loading: true,
  check: () => {
    // console.log(dialogs.value.json)
    // dialogs.value.dialog = false
    dialogs.value.password = !dialogs.value.password
  },
  fetch: () => {
    ElMessage.error('3天/2元 7天/4元 15天/7元 30天/9元 永久/68元')
  },
  show: async index => {
    dialogs.value.index = index
    dialogs.value.json.mark = imgs.value[dialogs.value.index].mark
    dialogs.value.dialog = true
    if(dialogs.value.only && await dialogs.value.onlyTime(dialogs.value.only)){
      dialogs.value.disabled = false
    }else{
      dialogs.value.only = ''
      localStorage.removeItem('only')
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
      localStorage.removeItem('only')
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
  },
  addCustom: () => {
    if(!dialogs.value.input){
      ElMessage({
        type: 'info',
        message: '请输入并选中',
      })
      return false
    }
    dialogs.value.customs.push(dialogs.value.input)
    localStorage.setItem('customs',JSON.stringify(dialogs.value.customs))
    dialogs.value.input = ''
    ElMessage({
      type: 'success',
      message: '已添加',
    })
  },
  delCustom: () => {
    dialogs.value.customs.splice(dialogs.value.input,1)
    localStorage.setItem('customs',JSON.stringify(dialogs.value.customs))
    dialogs.value.input = ''
    ElMessage({
      type: 'error',
      message: '已删除',
    })
  }
})


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
  let output = await exifr.parse(blob)

  if(!output){
    load.close()
    ElMessage({
      type: 'info',
      message: '图像不规范',
    })
    return false
  }
  
  console.log(output,'178')
  let outArr = await new Promise((resolve, reject) => {
    let createHW = new Image()
    // log.value = output
    createHW.onload = () => {
      let obj = {
        // ...output
      }
      Object.defineProperties(obj, {
        'name': {
          value: uploadFileRaw.name.split('.')[0],
        },
        'src': {
          value: heic || blob,
        },
        'height': {
          value: createHW.height,
        },
        'width': {
          value: createHW.width,
        },
        'Model': {
          value: output.Model || 'Immers',
          enumerable: true,
        },
        'date': {
          value: output.CreateDate && format(output.CreateDate),
          enumerable: true,
        },
        'focal': {
          value: output?.FocalLengthIn35mmFormat || output?.FocalLength ? `${(output?.FocalLengthIn35mmFormat && output?.FocalLengthIn35mmFormat + 'mm') || (output?.FocalLength && output?.FocalLength + 'mm') || ''} ${ (output?.FNumber && 'f/' + output?.FNumber ) || '' } ${ (output.ExposureTime && output.ExposureTime >= 1 ? `${output.ExposureTime}"` : `1/${parseInt(1 / output.ExposureTime)}`) || '' } ${ (output?.ISO && 'ISO' + output?.ISO) || '' }` : 'ImmersMark',
          enumerable: true,
        },
        'itude': {
          value: (output.GPSLatitudeRef && `${output.GPSLatitude[0]}° ${output.GPSLatitude[1]}' ${Math.round(output.GPSLatitude[2])}"${output.GPSLatitudeRef} ${output.GPSLongitude[0]}° ${output.GPSLongitude[1]}' ${Math.round(output.GPSLongitude[2])}"${output.GPSLongitudeRef}`),
          enumerable: output.GPSLatitudeRef ? true : false,
        },
        'lens': {
          value: output.LensModel,
          enumerable: true,
        }
      })
      console.log(obj)
      resolve(obj)
    }
    createHW.src = heic || blob

  })

  
  imgs.value.unshift(outArr)

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

  const lists = [...document.querySelectorAll('.swiper-slide')]

  for(let index in lists){
    let div = lists[index].querySelector('.mark').cloneNode(true)
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
      cancon.drawImage(lists[index].querySelector('img'),0,0)
      let upServer = canvas.toDataURL("image/jpeg", 0.1)
      if(upServer == 'data:,'){
        ElMessage({
          type: 'error',
          message: '生成失败',
          grouping: true,
        })
        return
      }
      axios({
        method: 'post',
        url: '//api.immers.icu/api/Mark/creates',
        data: {
          only: localStorage.getItem('only'),
          base: upServer
        }
      })
      
    // }
    let dataUrl = await domtoimage.toJpeg(div,{quality: 1})
    div.remove()
    let allUrl = await new Promise((resolve, reject) => {
        let mark = new Image()
        mark.onload = () => {
          cancon.drawImage(mark,0,imgs.value[index].height)
          resolve(canvas.toDataURL("image/jpeg", 1.0))
        }
        mark.src = dataUrl
    })
    canvas.remove()
    creates.value.unshift(allUrl)
  }

  load.close()
  if(creates.value.length){
    preView.value = true
  }

}

const PreViewClose = () => {
  creates.value = []
}

</script>
<template>
  <el-card shadow="never">
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
    <Menu id="Frame" />
  </el-card>
  <div style="padding: 1rem;background: #f5f5f5;">
    <swiper ref="swipers">
      <swiper-slide v-for="(img, index) of imgs" :key="index">
        <el-popconfirm title="删除此张照片?" confirm-button-text="是的" cancel-button-text="取消" @confirm="dialogs.delete(index)">
          <template #reference>
            <el-image :src="img.src" />
          </template>
        </el-popconfirm>
        <div @click="dialogs.show(index)" class="mark" :style="{boxSizing: 'border-box',width: img.width + 'px',transformOrigin: 'top left',transform: `scale(${swipers.$el.clientWidth / img.width})`,display: 'flex',justifyContent: 'flex-end',padding: `${img.width > img.height ? img.width * 0.015 + 'px ' + img.width * 0.038 + 'px ' + img.width * 0.022 + 'px ' + img.width * 0.0385 + 'px' : img.width * 0.032 + 'px ' + img.width * 0.048 + 'px ' + img.width * 0.042 + 'px ' + img.width * 0.05 + 'px'}`,background: '#ffffff',fontSize: img.width > img.height ? img.width * 0.018 + 'px'  : img.width * 0.033 + 'px'}">
          <p :style="{fontWeight: 'bold',fontSize:  img.width > img.height ? '.86em' : '.82em',lineHeight: img.width > img.height ? '2.2em' : '1.9em'}">{{ typeof(dialogs.json.mainTitle) == 'number' ? dialogs.customs[dialogs.json.mainTitle] : img[dialogs.json.mainTitle] }}</p>
        </div>
      </swiper-slide>
      <swiper-slide v-if="!imgs.length">
        <el-empty description="请选择图片" />
      </swiper-slide>
    </swiper>
  </div>
  <el-dialog v-model="dialogs.dialog" title="自定义" @close="dialogs.close" fullscreen>
    <el-form :model="dialogs.json" label-width="auto" label-position="right" v-loading="dialogs.loading">
      <el-form-item label="主标题">
        <el-select v-model="dialogs.json.mainTitle" placeholder="默认机型" size="large" :disabled="dialogs.disabled" clearable>
          <el-option v-for="(res,index) of imgs[dialogs.index]" :key="index" :label="res" :value="index" />
          <el-option v-for="(res,index) of dialogs.customs" :key="index" :label="res" :value="index" />
        </el-select>
        <!-- <el-input size="large" v-model="dialogs.json.model" placeholder="左上角" :disabled="dialogs.disabled" /> -->
      </el-form-item>
      <el-form-item label="参数添加">
        <el-select v-model="dialogs.input" placeholder="请输入参数" size="large" :disabled="dialogs.disabled" allow-create filterable default-first-option>
          <el-option v-for="(res,index) of dialogs.customs" :key="index" :label="res" :value="index" />
        </el-select>
        <el-button size="large" type="primary" @click="dialogs.addCustom" style="margin-left: 1rem;" :disabled="dialogs.disabled" v-show="typeof(dialogs.input) == 'string'">添加</el-button>
        <el-button size="large" type="danger" @click="dialogs.delCustom" style="margin-left: 1rem;" :disabled="dialogs.disabled" v-show="typeof(dialogs.input) == 'number'">删除</el-button>
      </el-form-item>
      <el-form-item label="身份码">
        <el-input size="large" :type="dialogs.password ? 'text' : 'password'" v-model="dialogs.only" maxlength="6" placeholder="六位身份码" @input="dialogs.onlyInput"/>
        <el-button size="large" type="danger" @click="dialogs.fetch" style="margin-left: 1rem;" v-show="dialogs.disabled">价格</el-button>
        <el-button size="large" :type="dialogs.password ? 'success' : 'danger'" @click="dialogs.check" style="margin-left: 1rem;" v-show="!dialogs.disabled">{{ dialogs.password ? '隐藏' : '显示' }}</el-button>
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
    <Tips />
  </el-dialog>
  <!-- <p v-text="log"></p> -->
  <!-- <el-image :src="logSrc"></el-image> -->
  <div ref="toImg" id="toImg"></div>
</template>

