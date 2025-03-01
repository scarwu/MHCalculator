/**
 * Lnaguage
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load States
import States from '@/scripts/states'

// Load Langs
import zhTWUI from '@/scripts/langs/zhTW/ui.json'
import zhTWDataset from '@/scripts/langs/zhTW/dataset.json'
import jaJPUI from '@/scripts/langs/jaJP/ui.json'
import jaJPDataset from '@/scripts/langs/jaJP/dataset.json'
import enUSUI from '@/scripts/langs/enUS/ui.json'
import enUSDataset from '@/scripts/langs/enUS/dataset.json'

const mapping = {
    zhTW: Object.assign({}, zhTWUI, zhTWDataset),
    jaJP: Object.assign({}, jaJPUI, jaJPDataset),
    enUS: Object.assign({}, enUSUI, enUSDataset)
}

let defaultLang = Constant.defaultLang
let browserLnag = navigator.language.replace('-', '')
let currentLang = States.getters.lang()

// Decide Current Lang
currentLang = Helper.isNotEmpty(Constant.langs[currentLang])
    ? currentLang : (
        Helper.isNotEmpty(Constant.langs[browserLnag])
            ? browserLnag : defaultLang
    )

// Set Status
States.actions.setLang(currentLang)

function getExistLang (key) {
    for (let lang in mapping) {
        if (Helper.isNotEmpty(mapping[lang][key])) {
            return mapping[lang][key]
        }
    }

    return null
}

export default (key, payload = null) => {
    let translated = null

    if (Helper.isNotEmpty(mapping[currentLang]) && Helper.isNotEmpty(mapping[currentLang][key])) {
        translated = mapping[currentLang][key]
    } else if (Helper.isNotEmpty(mapping[browserLnag]) && Helper.isNotEmpty(mapping[browserLnag][key])) {
        translated = mapping[browserLnag][key]
    } else if (Helper.isNotEmpty(mapping[defaultLang]) && Helper.isNotEmpty(mapping[defaultLang][key])) {
        translated = mapping[defaultLang][key]
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

    if (Helper.isEmpty(translated)) {
        translated = key
    }

    return translated
}
