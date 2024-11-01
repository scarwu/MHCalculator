/**
 * Icon Button
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useMemo } from 'react'

// Load Core
import Helper from '@/scripts/core/helper'

export default function IconButton (props) {
    const {iconName, altName, onClick} = props

    return useMemo(() => {
        Helper.debug('Component: Common -> IconButton')

        return (
            <div className="mhc-icon_button">
                <div className="mhc-body">
                    <a className="mhc-icon" onClick={onClick}>
                        <i className={`fas fa-${iconName}`}></i>
                    </a>
                </div>

                <div className="mhc-label">
                    <span>{altName}</span>
                </div>
            </div>
        )
    }, [iconName, altName, onClick])
}
