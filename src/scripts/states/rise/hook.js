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

export const useDataStore = () => {
    const [value, setValue] = useState(getters.dataStore())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.dataStore())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const usePlayerStatus = () => {
    const [value, setValue] = useState(getters.playerStatus())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.playerStatus())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const usePlayerEquips = () => {
    const [value, setValue] = useState(getters.playerEquips())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.playerEquips())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useRequiredConditions = () => {
    const [value, setValue] = useState(getters.requiredConditions())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.requiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useAlgorithmParams = () => {
    const [value, setValue] = useState(getters.algorithmParams())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.algorithmParams())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useCandidateBundles = () => {
    const [value, setValue] = useState(getters.candidateBundles())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.candidateBundles())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}
