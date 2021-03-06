import { IConfig } from '.';
import dayjs, { UnitType } from 'dayjs'
// import pako from 'pako'

export const promise = (res, rej) => {
    
}

export const genNow = () => {
    let now = new Date()
    let v = now.getFullYear()
    v = v * 100 + (now.getMonth() + 1)
    v = v * 100 + now.getDate()
    v = v * 100 + now.getHours()
    v = v * 100 + now.getMinutes()
    return v
}

export const makeExpire = (config: IConfig) => {
    if (!config.expire) {
        return 0
    }
    if (config.expire[0] === 'in') {
        let expiredIn = config.expire[1]
        if (/[0-9]+(Y|M|D|h|m|s|t)/.test(expiredIn)) {
            let type = expiredIn.substr(expiredIn.length - 1)
            let num = Number(expiredIn.substr(0, expiredIn.length - 1))
            // console.log(type, num)
            let expire = new Date()
            console.log(expire.getTime())
            switch (type) {
                case 'Y': expire.setFullYear(expire.getFullYear() + num); break;
                case 'M': expire.setMonth(expire.getMonth() + num); break;
                case 'D': expire.setDate(expire.getDate() + num); break;
                case 'h': expire.setHours(expire.getHours() + num); break;
                case 'm': expire.setMinutes(expire.getMinutes() + num); break;
                case 's': expire.setSeconds(expire.getSeconds() + num); break;
                case 't': expire.setMilliseconds(expire.getMilliseconds() + num); break;
                default: expire = null;
            }
            console.log(expire.getTime())

            if (expire) {
                return expire.getTime()
            } else {
                return 0
            }
        } else {
            console.log('expired time format illegal',config.expire)
        }
    } else if (config.expire[0] === 'at') {
        let at = config.expire[1]
        let now = dayjs()
        const subValuesList:UnitType[] = ['month', 'date', 'hour', 'minute', 'second', 'millisecond']

        const parser = (format, lastUnit, prefix = '') => {
            let currentStr = now.format(format)
            let atValue:any = at
            // console.log(format, unit,prefix , currentStr, at)
            
            let unitIndex = subValuesList.indexOf(lastUnit)
            if (prefix) {
                // 前缀标识的类型
                
                let currentUnit :UnitType = subValuesList[unitIndex + 1]
                atValue = Number(at.replace(prefix, ''))
                console.log(currentUnit, atValue, currentStr, at)

                if (lastUnit === 'week') {
                    // d：day of week 是个特殊情况
                    unitIndex = subValuesList.indexOf('month')
                    currentUnit = 'day'
                }

                // 判断当前周期是否已经超过该时间点
                if (Number(currentStr) > atValue) {
                    now = now.add(1, lastUnit)
                }
                // 设置所需要的时间
                now = now.set(currentUnit, atValue)
            } else { 
                // HH:mm:ss 之类的格式化类型
                if (currentStr > at) {
                    now = now.add(1, lastUnit)
                }
            }
            for (let i = unitIndex + 2; i < subValuesList.length; i++){
                if (subValuesList[i] === 'date') {
                    now = now.set(subValuesList[i], 1)
                } else {
                    now = now.set(subValuesList[i], 0)
                }
            }
        }
        // const setSubValues = (start) => {
        //     let flag = false
        //     subValuesList.forEach(unit => {
        //         if (start === unit) {
        //             flag = true
        //         }
        //         if (flag) {
        //             if (unit === 'date') {
        //                 now.set(unit, 1)
        //             } else {
        //                 now.set(unit, 0)
        //             }
        //         }
        //     })
        // }
        if (/\d{2}:\d{2}:\d{2}/.test(at)) {
                
            // HH:mm:ss
            parser('HH:mm:ss', 'day')
            let arr = at.split(':').map(v => Number(v))
            now = now.hour(arr[0]).minute(arr[1]).second(arr[2])
            // setSubValues('millisecond')
        } else if (/\d{2}:\d{2}/.test(at)) {
            // HH:mm
            parser('HH:mm', 'day')
            let arr = at.split(':').map(v => Number(v))
            now = now.hour(arr[0]).minute(arr[1])
            // setSubValues('second')
        } else if (/\d{1,2}-\d{1,2}/.test(at)) {
            // MM-DD  a date for each year... will this be useful?
            parser('M-D', 'year')
            let arr = at.split('-').map(v => Number(v))
            now = now.month(arr[0] - 1).date(arr[1])
            // setSubValues('hour')
        } else if (/M\d{1,2}/.test(at)) {
            // month of a year, exp: m2
            parser('M', 'year', 'M')
            // setSubValues('date')
        } else if (/D\d/.test(at)) {
            // date of a monty
            parser('D', 'month', 'D')
            // setSubValues('date')
        } else if (/d\d/.test(at)) {
            // day of a week, exp: w2, start from 0/Sunday
            parser('d', 'week', 'd')
            // setSubValues('hour')
        } else if (/h\d+/.test(at)) {
            // hours
            parser('H', 'date', 'h')
            // setSubValues('minute')
        } else if (/m\d+/.test(at)) {
            // minutes
            parser('m', 'hour', 'm')
            // setSubValues('second')
        } else if (/s\d+/.test(at)) {
            // seconds
            parser('s', 'minute', 's')
            // setSubValues('millisecond')
        } else {
            console.log('expired time format illegal',config.expire)

        }
        return now.valueOf()
    } else {
        return 0
    }
}

export const checkExpired = (expire: number) => {
    if (!expire) {
        return false
    }
    let now = Date.now()
    return now >= expire
}

/**
 * 深拷贝
 * @param {*} obj 拷贝对象(object or array)
 * @param {*} cache 缓存数组
 */
export function deepCopy (obj, cache = []) {
    // typeof [] => 'object'
    // typeof {} => 'object'
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    // 如果传入的对象与缓存的相等, 则递归结束, 这样防止循环
    /**
     * 类似下面这种
     * var a = {b:1}
     * a.c = a
     * 资料: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
     */
    const hit = cache.filter(c => c.original === obj)[0]
    if (hit) {
      return hit.copy
    }
  
    const copy = Array.isArray(obj) ?  [] :   {}
    // 将copy首先放入cache, 因为我们需要在递归deepCopy的时候引用它
    cache.push({
      original: obj,
      copy
    })
    Object.keys(obj).forEach(key => {
      copy[key] = deepCopy(obj[key], cache)
    })
  
    return copy
}
  
export const zip = (obj:any) => {
    // let str = JSON.stringify(obj)
    // str = pako.deflate(str, { to: 'string' })
    // return str
    return obj
}

export const unzip = (str:any) => {
    // str = pako.inflate(str, { to: 'string' })
    // return JSON.parse(str)
    return str
}