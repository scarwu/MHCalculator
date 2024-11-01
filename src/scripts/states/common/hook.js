/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import { useState, useEffect } from 'react'

// Load Store
import store from '@/scripts/states/store'

// Load Getter
import * as getters from './getter'

export const useLocale = () => {
    const [value, setValue] = useState(getters.locale())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.locale())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useModalData = (targetKey) => {
    const [value, setValue] = useState(getters.modalData(targetKey))

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.modalData(targetKey))
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useIsInited = () => {
    const [value, setValue] = useState(getters.isInited())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.isInited())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}
