/**
 * Basic Selector
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function BasicSelector (props) {
    const {defaultValue, options, onChange} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> BasicSelector')

        return (
            <div className="mhc-basic_selector">
                <select className="mhc-select" value={defaultValue} onChange={onChange}>
                    {options.map((option) => {
                        return (
                            <option key={option.key} value={option.key}>{option.value}</option>
                        )
                    })}
                </select>
                <div className="mhc-arrow-icon">
                    <i className="fa fa-caret-down"></i>
                </div>
            </div>
        )
    }, [defaultValue, options, onChange])
}
