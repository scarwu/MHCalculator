/**
 * Sharpness Bar
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function SharpnessBar (props) {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> SharpnessBar')

        return (
            <div className="mhc-sharpness_bar">
                <div className="mhc-steps">
                    {['red', 'orange', 'yellow', 'green', 'blue', 'white', 'purple'].map((step) => {
                        return (
                            <div key={step} className="mhc-step" style={{
                                width: (data.steps[step] / 4) + '%'
                            }}></div>
                        )
                    })}
                </div>

                <div className="mhc-mask" style={{
                    width: ((400 - data.value) / 4) + '%'
                }}></div>
            </div>
        )
    }, [data])
}
