/**
 * Lnaguage
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load Langs
import zhTWUI from '@/scripts/langs/zhTW/ui.json'
import zhTWDataset from '@/scripts/langs/zhTW/dataset.json'
import jaJPUI from '@/scripts/langs/jaJP/ui.json'
import jaJPDataset from '@/scripts/langs/jaJP/dataset.json'
import enUSUI from '@/scripts/langs/enUS/ui.json'
import enUSDataset from '@/scripts/langs/enUS/dataset.json'

let langs = {
    zhTW: Object.assign({}, zhTWUI, zhTWDataset),
    jaJP: Object.assign({}, jaJPUI, jaJPDataset),
    enUS: Object.assign({}, enUSUI, enUSDataset)
}

let defaultLang = Constant.defaultLang
let browserLnag = navigator.language.replace('-', '')
let currentLang = Status.get('sys:lang')

// Decide Current Lang
currentLang = Helper.isNotEmpty(Constant.langs[currentLang])
    ? currentLang : (
        Helper.isNotEmpty(Constant.langs[browserLnag])
            ? browserLnag : defaultLang
    )

// Set Status
Status.set('sys:lang', currentLang)

function getExistLang (key) {
    for (let lang in langs) {
        if (Helper.isNotEmpty(langs[lang][key])) {
            return langs[lang][key]
        }
    }

    return null
}

export default (key, payload = null) => {
    let translated = ''

    if (Helper.isNotEmpty(langs[currentLang]) && Helper.isNotEmpty(langs[currentLang][key])) {
        translated = langs[currentLang][key]
    } else if (Helper.isNotEmpty(langs[browserLnag]) && Helper.isNotEmpty(langs[browserLnag][key])) {
        translated = langs[browserLnag][key]
    } else if (Helper.isNotEmpty(langs[defaultLang]) && Helper.isNotEmpty(langs[defaultLang][key])) {
        translated = langs[defaultLang][key]
    } else {
        translated = getExistLang(key)
    }

    // Special: 使用 payload 帶進來的 _ 作為預設翻譯
    if (Helper.isEmpty(translated)
        && Helper.isNotEmpty(payload)
        && Helper.isNotEmpty(payload._)
    ) {
        translated = payload._
    }

    if (Helper.isNotEmpty(payload)) {
        for (let key in payload) {
            if ('_' === key) { // 跳過特殊鍵值
                continue
            }

            if (Helper.isNotEmpty(payload[key])) {
                translated = translated.replace(`:${key}:`, payload[key])
            } else {
                translated = translated.replace(`:${key}:`, '')
            }
        }
    }

    return translated
}
