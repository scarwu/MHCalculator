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

export const useRequiredSets = () => {
    const [value, setValue] = useState(getters.requiredSets())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.requiredSets())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useRequiredSkills = () => {
    const [value, setValue] = useState(getters.requiredSkills())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.requiredSkills())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useRequiredEquips = () => {
    const [value, setValue] = useState(getters.requiredEquips())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.requiredEquips())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useCurrentEquips = () => {
    const [value, setValue] = useState(getters.currentEquips())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.currentEquips())
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

export const useComputedResult = () => {
    const [value, setValue] = useState(getters.computedResult())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.computedResult())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useReservedBundles = () => {
    const [value, setValue] = useState(getters.reservedBundles())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.reservedBundles())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}

export const useCustomWeapon = () => {
    const [value, setValue] = useState(getters.customWeapon())

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(getters.customWeapon())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return value
}
