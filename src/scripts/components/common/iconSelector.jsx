/**
 * Icon Selector
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function IconSelector (props) {
    const {iconName, defaultValue, options, onChange} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> IconSelector')

        return (
            <div className="mhc-icon_selector">
                <div className="mhc-body">
                    <div className="mhc-icon">
                        <i className={`fas fa-${iconName}`}></i>
                    </div>
                    <select className="mhc-select" value={defaultValue} onChange={onChange}>
                        {options.map((option) => {
                            return (
                                <option key={option.key} value={option.key}>{option.value}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="mhc-arrow-icon">
                    <i className="fas fa-caret-down"></i>
                </div>
            </div>
        )
    }, [iconName, defaultValue, options, onChange])
}
