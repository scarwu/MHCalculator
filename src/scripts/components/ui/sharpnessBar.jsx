/**
 * Sharpness Bar
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import Helper from '@/scripts/core/helper'

export default function SharpnessBar (props) {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> SharpnessBar')

        return (
            <div className="mhc-sharpness_bar">
                <div className="mhc-steps">
                    {Constant.sharpnessSteps.map((step) => {
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
