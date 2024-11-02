/**
 * Icon Tab
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function IconTab (props) {
    const {iconName, altName, isActive, onClick} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> IconTab')

        let className = [
            'mhc-body'
        ]

        if (isActive) {
            className.push('is-active')
        }

        return (
            <div className="mhc-icon_tab">
                <a className={className.join(' ')} onClick={onClick}>
                    <div className="mhc-icon">
                        <i className={`far fa-${iconName}`}></i>
                    </div>
                </a>

                <div className="mhc-label">
                    <span>{altName}</span>
                </div>
            </div>
        )
    }, [iconName, altName, isActive, onClick])
}
