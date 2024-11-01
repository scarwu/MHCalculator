/**
 * Icon Switch
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function IconSwitch (props) {
    const {defaultValue, options, onChange} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> IconSwitch')

        let currentIndex = null

        options.forEach((option, optionIndex) => {
            if (defaultValue !== option.key) {
                return
            }

            currentIndex = optionIndex
        })

        const handlePrev = () => {
            if (Helper.isEmpty(options[currentIndex - 1])) {
                return
            }

            onChange(options[currentIndex - 1].key)
        }

        const handleNext = () => {
            if (Helper.isEmpty(options[currentIndex + 1])) {
                return
            }

            onChange(options[currentIndex + 1].key)
        }

        const handleChange = (event) => {
            onChange(event.target.value)
        }

        return (
            <div className="mhrc-icon_switch">
                <div className="mhrc-body">
                    <a className="mhrc-icon" onClick={handlePrev}>
                        <i className="fas fa-chevron-left"></i>
                    </a>
                    <select className="mhrc-select" value={defaultValue} onChange={handleChange}>
                        {options.map((option) => {
                            return (
                                <option key={option.key} value={option.key}>{option.value}</option>
                            )
                        })}
                    </select>
                    <a className="mhrc-icon" onClick={handleNext}>
                        <i className="fas fa-chevron-right"></i>
                    </a>
                </div>
            </div>
        )
    }, [defaultValue, options, onChange])
}
