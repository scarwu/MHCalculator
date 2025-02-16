/**
 * Candidate Bundles
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Config & Constant
import Config from '@/scripts/config'
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'
import Event from '@/scripts/core/event'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconTab from '@/scripts/components/ui/iconTab'

import QuickSetting from '@/scripts/components/block/world/candidateBundles/quickSetting'
import RequiredConditions from '@/scripts/components/block/world/candidateBundles/requiredConditions'
import BundleList from '@/scripts/components/block/world/candidateBundles/bundleList'

// Load States
import States from '@/scripts/states'

export default function CandidateBundles(props) {

    /**
     * Hooks
     */
    const _dataStore = States.world.hooks.useDataStore()
    const _computedResult = States.world.hooks.useComputedResult()

    const [stateTasks, updateTasks] = useState({})

    const refWorkers = useRef({})

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

                // refWorkers.current[tabIndex].terminate()
                // refWorkers.current[tabIndex] = null

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
        let tabIndex = _dataStore.candidateBundles.index

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
    }, [stateTasks, _dataStore])

    /**
     * Handle Functions
     */
    const handleCandidateBundlesSearch = useCallback(() => {
        let tabIndex = _dataStore.candidateBundles.index

        if (Helper.isNotEmpty(stateTasks[tabIndex])) {
            return
        }

        // Get All Data From Store
        let customWeapon = States.world.getters.customWeapon()
        let requiredEquips = States.world.getters.requiredEquips()
        let requiredSets = States.world.getters.requiredSets()
        let requiredSkills = States.world.getters.requiredSkills()
        let algorithmParams = States.world.getters.algorithmParams()

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

        if (Helper.isEmpty(refWorkers.current[tabIndex])) {
            refWorkers.current[tabIndex] = new Worker('assets/scripts/worker.min.js?' + Config.buildTime + '&' + tabIndex)
            refWorkers.current[tabIndex].onmessage = (event) => {
                Event.trigger('workerCallback', {
                    tabIndex: tabIndex,
                    action: event.data.action,
                    payload: event.data.payload
                })
            }
        }

        refWorkers.current[tabIndex].postMessage({
            customWeapon: customWeapon,
            requiredSets: requiredSets,
            requiredSkills: requiredSkills,
            requiredEquips: requiredEquips,
            algorithmParams: algorithmParams
        })
    }, [stateTasks, _dataStore])

    const handleCandidateBundlesCancel = useCallback(() => {
        let tabIndex = _dataStore.candidateBundles.index

        refWorkers.current[tabIndex].terminate()
        refWorkers.current[tabIndex] = null

        stateTasks[tabIndex] = null

        updateTasks(Helper.deepCopy(stateTasks))
    }, [stateTasks, _dataStore])

    const handleShowAllAlgorithmSetting = useCallback(() => {
        States.common.actions.showModal('algorithmSetting', {
            mode: 'all'
        })
    }, [])

    const handleSwitchTempData = useCallback((index) => {
        States.world.actions.switchDataStore('candidateBundles', index)
    }, [])

    return (
        <div className="mhc-block mhc-bundles">
            <div className="mhc-panel">
                <span className="mhc-title">{_('candidateBundle')}</span>

                <div className="mhc-icons_bundle-left">
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[0]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 1'}
                        isActive={0 === _dataStore.candidateBundles.index}
                        onClick={() => {handleSwitchTempData(0)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[1]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 2'}
                        isActive={1 === _dataStore.candidateBundles.index}
                        onClick={() => {handleSwitchTempData(1)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[2]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 3'}
                        isActive={2 === _dataStore.candidateBundles.index}
                        onClick={() => {handleSwitchTempData(2)}} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[3]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 4'}
                        isActive={3 === _dataStore.candidateBundles.index}
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
                {Helper.isNotEmpty(stateTasks[_dataStore.candidateBundles.index]) ? (
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
                                    <span>{stateTasks[_dataStore.candidateBundles.index].bundleCount}</span>
                                </div>
                                <div className="col-3 mhc-name">
                                    <span>{_('searchPercent')}</span>
                                </div>
                                <div className="col-3 mhc-value">
                                    <span>{stateTasks[_dataStore.candidateBundles.index].searchPercent} %</span>
                                </div>
                                <div className="col-3 mhc-name">
                                    <span>{_('timeRemaining')}</span>
                                </div>
                                <div className="col-9 mhc-value">
                                    <span>{Helper.convertTimeFormat(stateTasks[_dataStore.candidateBundles.index].timeRemaining)}</span>
                                </div>
                            </div>
                        </div>
                        <RequiredConditions data={stateTasks[_dataStore.candidateBundles.index].required} />
                    </Fragment>
                ) : (
                    Helper.isEmpty(_computedResult) ? (
                        <QuickSetting />
                    ) : (
                        <Fragment>
                            <RequiredConditions data={_computedResult.required} />
                            <BundleList />
                        </Fragment>
                    )
                )}
            </div>
        </div>
    )
}
