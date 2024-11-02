/**
 * Basic Input
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function BasicInput (props) {
    const {type, defaultValue, placeholder, onChange, bypassRef} = props

    let currentType = (Helper.isEmpty(type) || '' === type) ? 'text' : type

    return useMemo(() => {
        Helper.debug('Component: Common -> BasicInput')

        return (
            <div className="mhc-basic_input">
                <input className="mhc-input"
                    type={currentType}
                    ref={bypassRef}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    onChange={onChange} />
            </div>
        )
    }, [defaultValue, placeholder, onChange, bypassRef])
}
