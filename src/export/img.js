import exifr from 'exifr'
import heic2any from 'heic2any'
import glMarks from '../export/marks'
const lsMarks = JSON.parse(localStorage.getItem('marks')) || []
const marks = [...lsMarks,...glMarks]


const format = (Date) => {
    var Y = Date.getFullYear();
    var M = (Date.getMonth() + 1 + '').padStart(2,'0');
    var D = (Date.getDate() + '').padStart(2,'0');
    var H = (Date.getHours() + '').padStart(2,'0');
    var Mi = (Date.getMinutes() + '').padStart(2,'0');
    var S = (Date.getSeconds() + '').padStart(2,'0');
    return Y + '.' + M + '.' + D + ' ' + H + ':' + Mi + ':' + S;
}

export const img = async (uploadFileRaw) => {

  let blob = URL.createObjectURL(uploadFileRaw)

  let output = await exifr.parse(blob).catch(err => {})

  if(!output){
    ElMessage({
      type: 'info',
      message: '图像不规范',
    })
    return false
  }

  const heic = await heic2any({
    blob: uploadFileRaw,
    toType: "image/jpeg",
    quality: 1,
  })
  .then(async (resultBlob) => {
    URL.revokeObjectURL(blob)
    return URL.createObjectURL(resultBlob)
  })
  .catch(function (x) {
    return false
  })
  
//   console.log(output,'178')
  const outArr = await new Promise((resolve, reject) => {
    const createHW = new Image()
    let markIndex = output.Make && marks.findIndex(item => !item.custom && output.Make.toLowerCase().search(item.val) >= 0 ? true : false)
    // console.log(markIndex)
    let mark = markIndex >= 0 ? markIndex : 0
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
        'mark': {
          value: mark,
          writable: true,
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
    //   console.log(obj)
      resolve(obj)
    }

    createHW.src = heic || blob

  })

  return outArr

}