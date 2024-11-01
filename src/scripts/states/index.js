/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import store from './store'
import * as commonAction from './common/action'
import * as commonGetter from './common/getter'
import * as commonHook from './common/hook'
import * as riseAction from './rise/action'
import * as riseGetter from './rise/getter'
import * as riseHook from './rise/hook'

export default {
    store,
    common: {
        actions: commonAction,
        getters: commonGetter,
        hooks: commonHook
    },
    rise: {
        actions: riseAction,
        getters: riseGetter,
        hooks: riseHook
    }
}
