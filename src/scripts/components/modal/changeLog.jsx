/**
 * ChangeLog Modal
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

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

const targetModalKey = 'changeLog'

export default function ChangeLogModal (props) {

    /**
     * Hooks
     */
    const _lang = States.hooks.useLang()
    const _modalData = States.hooks.useModalData(targetModalKey)

    const refModal = useRef(null)

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.actions.hideModal(targetModalKey)
    }, [])

    const changeLog = useMemo((event) => {
        return Helper.isNotEmpty(changeLogMapping[_lang])
            ? changeLogMapping[_lang] : null
    }, [ _lang ])

    return Helper.isNotEmpty(_modalData) ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhc-modal mhc-slim-modal">
                <div className="mhc-panel">
                    <span className="mhc-title">{_('changeLog')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.actions.hideModal(targetModalKey) }} />
                    </div>
                </div>
                <div className="mhc-list">
                    <div className="mhc-wrapper">
                        {Helper.isNotEmpty(changeLog) ? changeLog.replace(/\n/g, '').split('<hr>').map((log, index) => {
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
                        }) : false}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
