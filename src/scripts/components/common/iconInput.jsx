/**
 * Icon Input
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo, forwardRef } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function IconInput (props) {
    const {type, iconName, defaultValue, placeholder, onChange, bypassRef} = props

    let currentType = (Helper.isEmpty(type) || '' === type) ? 'text' : type

    return useMemo(() => {
        Helper.debug('Component: Common -> IconInput')

        return (
            <div className="mhrc-icon_input">
                <div className="mhrc-body">
                    <div className="mhrc-icon">
                        <i className={`fas fa-${iconName}`}></i>
                    </div>
                    <input className="mhrc-input"
                        ref={bypassRef}
                        type={currentType}
                        defaultValue={defaultValue}
                        placeholder={placeholder}
                        onChange={onChange} />
                </div>
            </div>
        )
    }, [iconName, defaultValue, placeholder, onChange, bypassRef])
}
