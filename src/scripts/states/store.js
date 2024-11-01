/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

// Load Core
import Helper from '@/scripts/core/helper'

// Load Store
import commonStore from './common/store'
import riseStore from './rise/store'

// Middleware
const diffLogger = store => next => action => {
    let prevState = store.getState()
    let result = next(action)
    let nextState = store.getState()
    let diffState = {}

    if ('production' !== process.env.NODE_ENV) {
        for (let scope in prevState) {
            for (let key in prevState[scope]) {
                if (JSON.stringify(prevState[scope][key]) === JSON.stringify(nextState[scope][key])) {
                    continue
                }

                diffState[`${scope}:${key}`] = nextState[scope][key]
            }
        }

        Helper.debug('State: action', action)
        Helper.debug('State: diffState', diffState)
    }

    return result
}

const composeEnhancers = ('production' !== process.env.NODE_ENV)
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    : compose

export default createStore(combineReducers({
    common: commonStore,
    rise: riseStore,
}), composeEnhancers(applyMiddleware(diffLogger)))
