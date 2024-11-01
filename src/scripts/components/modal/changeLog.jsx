/**
 * ChangeLog Modal
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'

// Load States
import States from '@/scripts/states'

// Load Markdown Files
import zhTWChangeLog from '@/scripts/langs/zhTW/changeLog.md'
import jaJPChangeLog from '@/scripts/langs/jaJP/changeLog.md'
import enUSChangeLog from '@/scripts/langs/enUS/changeLog.md'

/**
 * Variables
 */
const changeLogMapping = {
    zhTW: zhTWChangeLog,
    jaJP: jaJPChangeLog,
    enUS: enUSChangeLog
}

/**
 * Handle Functions
 */
const getChangeLog = () => {
    let changeLog = Helper.isNotEmpty(changeLogMapping[Status.get('sys:lang')])
        ? changeLogMapping[Status.get('sys:lang')] : false

    if (false === changeLog) {
        return false
    }

    return changeLog.replace(/\n/g, '').split('<hr>').map((log, index) => {
        let [all, title, content] = log.trim().match(/^\<h3.+\>(.+)\<\/h3\>(.+)$/)

        return (
            <div key={index} className="mhc-item mhc-item-2-step">
                <div className="col-12 mhc-name">
                    <span>{title}</span>
                </div>
                <div className="col-12 mhc-value mhc-description"
                    dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        )
    })
}

export default function ChangeLogModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('changeLog'))
    const refModal = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('changeLog'))
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('changeLog')
    }, [])

    return Helper.isNotEmpty(stateModalData) ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhc-modal mhc-slim-modal">
                <div className="mhc-panel">
                    <span className="mhc-title">{_('changeLog')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.setter.hideModal('changeLog') }} />
                    </div>
                </div>
                <div className="mhc-list">
                    <div className="mhc-wrapper">
                        {getChangeLog()}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
