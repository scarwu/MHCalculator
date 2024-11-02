/**
 * Candidate Bundles
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useCallback } from 'react'

// Load Config & Constant
import Config from '@/scripts/config'
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'
import Event from '@/scripts/core/event'

// Load Components
import QuickSetting from '@/scripts/components/block/world/candidateBundles/quickSetting'
import RequiredConditions from '@/scripts/components/block/world/candidateBundles/requiredConditions'
import BundleList from '@/scripts/components/block/world/candidateBundles/bundleList'
import IconButton from '@/scripts/components/ui/iconButton'
import IconTab from '@/scripts/components/ui/iconTab'

// Load State Control
import States from '@/scripts/states'

// Variables
let workers = {}

/**
 * Handle Functions
 */
const handleShowAllAlgorithmSetting = () => {
    States.world.actions.showAlgorithmSetting({
        mode: 'all'
    })
}

const handleSwitchTempData = (index) => {
    States.world.actions.switchTempData('candidateBundles', index)
}

const convertTimeFormat = (seconds) => {
    let text = ''

    if (seconds > 3600) {
        let hours = parseInt(seconds / 3600)

        seconds -= hours * 3600
        text += hours + ' ' + _('hour') + ' '
    }

    if (seconds > 60) {
        let minutes = parseInt(seconds / 60)

        seconds -= minutes * 60
        text += minutes + ' ' + _('minute') + ' '
    }

    text += seconds + ' ' + _('second')

    return text
}

export default function CandidateBundles(props) {

    /**
     * Hooks
     */
    const [stateTempData, updateTempData] = useState(States.world.getters.getTempData())
    const [stateComputedResult, updateComputedResult] = useState(States.world.getters.getComputedResult())
    const [stateTasks, updateTasks] = useState({})

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateTempData(States.world.getters.getTempData())
            updateComputedResult(States.world.getters.getComputedResult())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    // Worker Callback
    useEffect(() => {
        Event.on('workerCallback', 'tasks', (data) => {
            let tabIndex = data.tabIndex
            let action = data.action
            let payload = data.payload

            switch (action) {
            case 'progress':
                if (Helper.isNotEmpty(payload.bundleCount)) {
                    stateTasks[tabIndex].bundleCount = payload.bundleCount
                }

                if (Helper.isNotEmpty(payload.searchPercent)) {
                    stateTasks[tabIndex].searchPercent = payload.searchPercent
                }

                if (Helper.isNotEmpty(payload.timeRemaining)) {
                    stateTasks[tabIndex].timeRemaining = payload.timeRemaining
                }

                updateTasks(Helper.deepCopy(stateTasks))

                break
            case 'result':
                handleSwitchTempData(tabIndex)

                States.world.actions.saveComputedResult(payload.computedResult)

                // workers[tabIndex].terminate()
                // workers[tabIndex] = null

                stateTasks[tabIndex] = null

                updateTasks(Helper.deepCopy(stateTasks))

                break
            default:
                break
            }
        })

        return () => {
            Event.off('workerCallback', 'tasks')
        }
    }, [stateTasks])

    // Search Remaining Timer
    useEffect(() => {
        let tabIndex = stateTempData.candidateBundles.index

        if (Helper.isEmpty(stateTasks[tabIndex])) {
            return
        }

        let timerId = setInterval(() => {
            if (0 === stateTasks[tabIndex].timeRemaining) {
                return
            }

            stateTasks[tabIndex].timeRemaining--

            updateTasks(Helper.deepCopy(stateTasks))
        }, 1000)

        return () => {
            clearInterval(timerId)
        }
    }, [stateTasks, stateTempData])

    /**
     * Handle Functions
     */
    const handleCandidateBundlesSearch = useCallback(() => {
        let tabIndex = stateTempData.candidateBundles.index

        if (Helper.isNotEmpty(stateTasks[tabIndex])) {
            return
        }

        // Get All Data From Store
        let customWeapon = States.world.getters.getCustomWeapon()
        let requiredEquips = States.world.getters.getRequiredEquips()
        let requiredSets = States.world.getters.getRequiredSets()
        let requiredSkills = States.world.getters.getRequiredSkills()
        let algorithmParams = States.world.getters.getAlgorithmParams()

        if (0 === requiredSets.length && 0 === requiredSkills.length) {
            return
        }

        stateTasks[tabIndex] = {
            bundleCount: 0,
            searchPercent: 0,
            timeRemaining: 0,
            required: {
                equips: requiredEquips,
                sets: requiredSets,
                skills: requiredSkills
            }
        }

        updateTasks(Helper.deepCopy(stateTasks))

        if (Helper.isEmpty(workers[tabIndex])) {
            workers[tabIndex] = new Worker('assets/scripts/worker.min.js?' + Config.buildTime + '&' + tabIndex)
            workers[tabIndex].onmessage = (event) => {
                Event.trigger('workerCallback', {
                    tabIndex: tabIndex,
                    action: event.data.action,
                    payload: event.data.payload
                })
            }
        }

        workers[tabIndex].postMessage({
            customWeapon: customWeapon,
            requiredSets: requiredSets,
            requiredSkills: requiredSkills,
            requiredEquips: requiredEquips,
            algorithmParams: algorithmParams
        })
    }, [stateTasks, stateTempData])

    const handleCandidateBundlesCancel = useCallback(() => {
        let tabIndex = stateTempData.candidateBundles.index

        workers[tabIndex].terminate()
        workers[tabIndex] = null

        stateTasks[tabIndex] = null

        updateTasks(Helper.deepCopy(stateTasks))
    }, [stateTasks, stateTempData])

    let tabIndex = stateTempData.candidateBundles.index

    return (
        <div className="col mhc-bundles">
            <div className="mhc-panel">
                <span className="mhc-title">{_('candidateBundle')}</span>

                <div className="mhc-icons_bundle-left">
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[0]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 1'}
                        isActive={0 === tabIndex}
                        onClick={() => {handleSwitchTempData(0)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[1]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 2'}
                        isActive={1 === tabIndex}
                        onClick={() => {handleSwitchTempData(1)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[2]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 3'}
                        isActive={2 === tabIndex}
                        onClick={() => {handleSwitchTempData(2)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[3]) ? 'cog fa-spin' : 'circle-o'}
                        altName={_('tab') + ' 4'}
                        isActive={3 === tabIndex}
                        onClick={() => {handleSwitchTempData(3)}} />
                </div>

                <div className="mhc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={States.world.actions.cleanComputedResult} />
                    <IconButton
                        iconName="cog" altName={_('setting')}
                        onClick={handleShowAllAlgorithmSetting} />
                    <IconButton
                        iconName="search" altName={_('search')}
                        onClick={handleCandidateBundlesSearch} />
                </div>
            </div>

            <div key="list" className="mhc-list">
                {Helper.isNotEmpty(stateTasks[tabIndex]) ? (
                    <Fragment>
                        <div className="mhc-item mhc-item-3-step">
                            <div className="col-12 mhc-name">
                                <span>{_('searching')} ...</span>
                                <div className="mhc-icons_bundle">
                                    <IconButton
                                        iconName="times" altName={_('cancel')}
                                        onClick={handleCandidateBundlesCancel} />
                                </div>
                            </div>
                            <div className="col-12 mhc-content">
                                <div className="col-3 mhc-name">
                                    <span>{_('bundleCount')}</span>
                                </div>
                                <div className="col-3 mhc-value">
                                    <span>{stateTasks[tabIndex].bundleCount}</span>
                                </div>
                                <div className="col-3 mhc-name">
                                    <span>{_('searchPercent')}</span>
                                </div>
                                <div className="col-3 mhc-value">
                                    <span>{stateTasks[tabIndex].searchPercent} %</span>
                                </div>
                                <div className="col-3 mhc-name">
                                    <span>{_('timeRemaining')}</span>
                                </div>
                                <div className="col-9 mhc-value">
                                    <span>{convertTimeFormat(stateTasks[tabIndex].timeRemaining)}</span>
                                </div>
                            </div>
                        </div>
                        <RequiredConditions data={stateTasks[tabIndex].required} />
                    </Fragment>
                ) : (
                    Helper.isEmpty(stateComputedResult) ? (
                        <QuickSetting />
                    ) : (
                        <Fragment>
                            <RequiredConditions data={stateComputedResult.required} />
                            <BundleList />
                        </Fragment>
                    )
                )}
            </div>
        </div>
    )
}
