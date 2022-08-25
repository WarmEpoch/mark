<script setup>
import { ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElPopconfirm } from 'element-plus'
import { Swiper, SwiperSlide } from 'swiper/vue'
import exifr from 'exifr'
import heic2any from 'heic2any'
import domtoimage from 'dom-to-image'


import 'swiper/css'

const swipers = ref(null)
const toImg = ref(null)
const imgs = ref([])
const log = ref()
const logSrc = ref()
const loading = ref()
const dialogs = ref({
  dialog: false,
  index: 0,
  json: {},
  check: () => {
    imgs.value[dialogs.value.index] = {...imgs.value[dialogs.value.index],...dialogs.value.json}
    dialogs.value.dialog = false
  },
  show: (json,index) => {
    dialogs.value.json = JSON.parse(JSON.stringify(json))
    dialogs.value.index = index
    dialogs.value.dialog = true
  },
  delete: (index) => {
    imgs.value.splice(index,1)
  }
})

const mark = ref([
  {
    name: '徕卡',
    val: 'leica',
  },
  {
    name: '哈苏',
    val: 'hasu',
  },
  {
    name: '阿莱',
    val: 'arri',
  },
  {
    name: '蔡司',
    val: 'zeiss',
  },
  {
    name: '富士',
    val: 'fujifilm',
  },
  {
    name: '索尼',
    val: 'sony',
  },
  {
    name: '佳能',
    val: 'canon',
  },
  {
    name: '尼康',
    val: 'nikon',
  },
  {
    name: 'FotorGear',
    val: 'fotorgear',
  },
  {
    name: 'SIGMA',
    val: 'sigma',
  },
  {
    name: '宾得',
    val: 'pentax',
  },
  {
    name: '奥林巴斯',
    val: 'olympus',
  },
  {
    name: 'TAMRON',
    val: 'tamron',
  },
  {
    name: 'RICOH',
    val: 'ricoh',
  },
  {
    name: '苹果',
    val: 'apple',
  },
])


const ImgChange = async (uploadFileRaw) => {
  loading.value = ElLoading.service({
    lock: true,
    text: '图片加载中',
  })

  let blob = URL.createObjectURL(uploadFileRaw)

  const heic = await heic2any({
    blob: uploadFileRaw,
    toType: "image/png",
  })
  .then(function (resultBlob) {
    return URL.createObjectURL(resultBlob)
  })
  .catch(function (x) {
    return false
  })
  
  // logSrc.value = heic ? heic : blob

  await exifr.parse(blob).then(output => {
    console.log(output)
    // log.value = output
    imgs.value.unshift({
      name: uploadFileRaw.name.split('.')[0],
      src: heic ? heic : blob,
      mark: output.Make && mark.value.findIndex(item => item.val == output.Mark) >= 0 ? output.Make.toLowerCase() : 'leica',
      height: output?.Orientation?.indexOf('90') > 0 || output?.Orientation?.indexOf('270') > 0 ? output.ExifImageWidth || output.ImageWidth : output.ExifImageHeight || output.ImageHeight,
      width: output?.Orientation?.indexOf('90') > 0 || output?.Orientation?.indexOf('270') > 0 ? output.ExifImageHeight || output.ImageHeight : output.ExifImageWidth || output.ImageWidth,
      model: output.Model || 'Immers',
      date: output.GPSLatitudeRef && output.CreateDate ? format(output.CreateDate) : '',
      focal: output?.FocalLengthIn35mmFormat || output?.FocalLength ? `${output?.FocalLengthIn35mmFormat || output?.FocalLength || false}mm f/${ output?.FNumber || false } ${output.ExposureTime ? output.ExposureTime >= 1 ? output.ExposureTime : `1/${1 / output.ExposureTime}` : false} ISO${ output?.ISO || false }` : 'ImmersMark',
      itude: output.GPSLatitudeRef && output.GPSLatitudeRef ? `${output.GPSLatitude[0]}° ${output.GPSLatitude[1]}' ${Math.round(output.GPSLatitude[2])}"${output.GPSLatitudeRef} ${output.GPSLongitude[0]}° ${output.GPSLongitude[1]}' ${Math.round(output.GPSLongitude[2])}"${output.GPSLongitudeRef}` : output.CreateDate ?  format(output.CreateDate) : format(new Date()),
    })
    console.log('unshift')
  })

  console.log('loaded')

  loading.value.close()

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

const save = () =>{
  loading.value = ElLoading.service({
    lock: true,
    text: '图片保存中',
  })
  document.querySelectorAll('.swiper-slide').forEach(async (el,index) => {
    let div = document.createElement('div')
    div.style.width = `${imgs.value[index].width}px`
    div.innerHTML = el.querySelector('div').innerHTML
    toImg.value.append(div)

    await domtoimage.toBlob(div).then(blob => {
        let canvas = document.createElement('canvas')
        canvas.width = div.clientWidth
        canvas.height = div.clientHeight
        div.remove()
        toImg.value.append(canvas)
        let cancon = canvas.getContext('2d')
        let mark = new Image()
        mark.src = URL.createObjectURL(blob)
        mark.onload = () => {
          cancon.drawImage(mark,0,0)
          mark = false
          if(img) return false
          let link = document.createElement('a')
          link.download = `${imgs.value[index].name}-ImmersMark.png`
          link.href = canvas.toDataURL("image/png")
          link.click()
          link.remove()
          canvas.remove()
        }
        let img = new Image()
        img.src = imgs.value[index].src
        img.onload =  () => {
          cancon.drawImage(img,0,0)
          img = false
          if(mark) return false
          let link = document.createElement('a')
          link.download = `${imgs.value[index].name}-ImmersMark.png`
          link.href = canvas.toDataURL("image/png")
          link.click()
          link.remove()
          canvas.remove()
        }
    })


    if(index >= document.querySelectorAll('.swiper-slide').length - 1){
      loading.value.close()
    }
  })
}


</script>
<template>

  <el-card>
    <template #header>
      <el-image src="//web.immers.icu/assets/logo.svg" />
      <el-upload class="avatar-uploader" :before-upload="ImgChange" :show-file-list="false" accept="image" multiple>
        <template #trigger>
          <el-button type="primary" >选择</el-button>
        </template>
        <template #default>
          <el-button type="success" :disabled="!imgs.length" @click="save">保存</el-button>
          <a href="https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg3MTgwNzU0NA==&action=getalbum&album_id=2544483400624160768#wechat_redirect" target="_blank"><el-button>教程</el-button></a>
        </template>
      </el-upload>
    </template>
    <swiper ref="swipers">
      <swiper-slide v-for="(img, index) of imgs" :key="index">
        <div :style="{width: img.width + 'px',zoom: swipers.$el.clientWidth / img.width}">
        <el-popconfirm title="删除此张照片?" confirm-button-text="是的" cancel-button-text="取消" @confirm="dialogs.delete(index)">
          <template #reference>
            <el-image :src="img.src" />
          </template>
        </el-popconfirm>
          <div @click="dialogs.show(img,index)" :style="{display: 'flex',justifyContent: 'space-between',padding: `${img.width > img.height ? img.width * 0.015 + 'px ' + img.width * 0.038 + 'px ' + img.width * 0.022 + 'px ' + img.width * 0.0385 + 'px' : img.width * 0.032 + 'px ' + img.width * 0.048 + 'px ' + img.width * 0.042 + 'px ' + img.width * 0.05 + 'px'}`,background: '#ffffff',fontSize: img.width > img.height ? img.width * 0.018 + 'px'  : img.width * 0.033 + 'px'}">
            <div style="display: flex;flex-flow: column wrap;">
              <p :style="{fontFamily: 'semibold',fontSize:  img.width > img.height ? '.86em' : '.82em',lineHeight: img.width > img.height ? '2.2em' : '1.9em'}">{{ img.model }}</p>
              <p style="font-family: 'regular';font-size: .69em;color: #818185;">{{ img.date }}</p>
            </div>
            <div style="display: flex;flex-flow: column wrap;position: relative;">
              <el-image :src="`//web.immers.icu/assets/${img.mark}.svg`" :style="{position: 'absolute',top: `${img.width > img.height ? img.width * 0.0103 + 'px' : img.width * 0.014 + 'px'}`,bottom: `${img.width > img.height ? img.width * 0.0028 + 'px' : img.width * 0.0045 + 'px'}`,left: `-${img.width > img.height ? img.width * 0.01 + 'px' : img.width * 0.018 + 'px'}`,transform: 'translateX(-100%)',paddingRight: `${img.width > img.height ? img.width * 0.01 + 'px' : img.width * 0.018 + 'px'}`,borderRight: `solid ${img.width * 0.001}px #ccc`}" ></el-image>
              <p :style="{fontFamily: 'semibold',fontSize: img.width > img.height ? '.84em' : '.78em',lineHeight: img.width > img.height ? '2.15em' : '2em'}">{{ img.focal }}</p>
              <p style="font-family: 'regular';font-size: .67em;color: #7f7f7f;">{{ img.itude }}</p>
            </div>
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
        <el-option v-for="item of mark" :key="item.val" :label="item.name" :value="item.val" />
      </el-select>
    </el-form-item>
    <el-form-item label="主标题">
      <el-input v-model="dialogs.json.model" placeholder="左上角" />
    </el-form-item>
    <el-form-item label="副主标题">
      <el-input v-model="dialogs.json.focal" placeholder="右上角" />
    </el-form-item>
    <el-form-item label="次标题">
      <el-input v-model="dialogs.json.date" placeholder="左下角" />
    </el-form-item>
    <el-form-item label="副次标题">
      <el-input v-model="dialogs.json.itude" placeholder="右下角" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="dialogs.check">确定</el-button>
    </el-form-item>
  </el-form>
    <!-- <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogs.check">确定</el-button>
      </span>
    </template> -->
  </el-dialog>
  <!-- <p v-text="log"></p> -->
  <!-- <el-image :src="logSrc"></el-image> -->
  <div ref="toImg" style="position: fixed;left: 100%;"></div>
</template>

<style scoped>
@font-face {
  font-family: 'medium';
  src: url(//cdn.jsdelivr.net/gh/WarmEpoch/mark/MiSans-Mediu.ttf);
}

@font-face {
  font-family: 'regular';
  src: url(./assets/MiSans-Regular.ttf);
}

@font-face {
  font-family: 'semibold';
  src: url(./assets/MiSans-Semibold.ttf);
}

p {
  padding: 0;
  margin: 0;
  outline: none;
  white-space: nowrap;
}

a{
  text-decoration: unset;
  color: unset;
}

.el-image {
  display: block;
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

.avatar-uploader .el-button {
  margin-left: 1rem;
}

:deep(.swiper-wrapper){
  display: flex;
  align-items: center;
}

</style>
