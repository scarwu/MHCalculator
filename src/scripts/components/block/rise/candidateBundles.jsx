/**
 * Candidate Bundles
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
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

import QuickSetting from '@/scripts/components/block/rise/candidateBundles/quickSetting'
import RequiredConditions from '@/scripts/components/block/rise/candidateBundles/requiredConditions'
import BundleList from '@/scripts/components/block/rise/candidateBundles/bundleList'

// Load States
import States from '@/scripts/states'

export default function CandidateBundlesBlock (props) {

    /**
     * Hooks
     */
    const _dataStore = States.rise.hooks.useDataStore()
    const _candidateBundles = States.rise.hooks.useCandidateBundles()

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
                States.rise.actions.switchDataStore('candidateBundles', tabIndex)
                States.rise.actions.replaceCandidateBundles(payload.candidateBundles)

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
        let requiredConditions = States.rise.getters.requiredConditions()
        let algorithmParams = States.rise.getters.algorithmParams()

        if (Helper.isEmpty(requiredConditions.sets) && Helper.isEmpty(requiredConditions.skills)) {
            return
        }

        if (0 === requiredConditions.sets.length && 0 === requiredConditions.skills.length) {
            return
        }

        stateTasks[tabIndex] = {
            bundleCount: 0,
            searchPercent: 0,
            timeRemaining: 0,
            requiredConditions: requiredConditions
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
            requiredConditions: requiredConditions,
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

    return (
        <div className="mhc-block mhc-bundles">
            <div className="mhc-panel">
                <span className="mhc-title">{_('candidateBundle')}</span>

                <div className="mhc-icons_bundle-left">
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[0]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 1'}
                        isActive={0 === _dataStore.candidateBundles.index}
                        onClick={() => { States.rise.actions.switchDataStore('candidateBundles', 0) }} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[1]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 2'}
                        isActive={1 === _dataStore.candidateBundles.index}
                        onClick={() => { States.rise.actions.switchDataStore('candidateBundles', 1) }} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[2]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 3'}
                        isActive={2 === _dataStore.candidateBundles.index}
                        onClick={() => { States.rise.actions.switchDataStore('candidateBundles', 2) }} />
                    <IconTab
                        iconName={Helper.isNotEmpty(stateTasks[3]) ? 'cog fa-spin' : 'circle'}
                        altName={_('tab') + ' 4'}
                        isActive={3 === _dataStore.candidateBundles.index}
                        onClick={() => { States.rise.actions.switchDataStore('candidateBundles', 3) }} />
                </div>

                <div className="mhc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={States.rise.actions.cleanCandidateBundles} />
                    <IconButton
                        iconName="cog" altName={_('setting')}
                        onClick={() => {
                            States.common.actions.showModal('algorithmSetting', {
                                mode: 'all'
                            })
                        }} />
                    <IconButton
                        iconName="search" altName={_('search')}
                        onClick={() => { handleCandidateBundlesSearch() }} />
                </div>
            </div>

            <div key="list" className="mhc-list">
                {Helper.isNotEmpty(stateTasks[_dataStore.candidateBundles.index]) ? (
                    <Fragment>
                        <div className="mhc-item mhc-item-3-step">
                            <div className="col-12 mhc-name">
                                <span>{_('searching')} ...</span>
                                <div className="mhc-icons_bundle-right">
                                    <IconButton
                                        iconName="times" altName={_('cancel')}
                                        onClick={() => { handleCandidateBundlesCancel() }} />
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
                        <RequiredConditions data={stateTasks[_dataStore.candidateBundles.index].requiredConditions} />
                    </Fragment>
                ) : (
                    Helper.isEmpty(_candidateBundles.requiredConditions) ? (
                        <QuickSetting />
                    ) : (
                        <Fragment>
                            <RequiredConditions data={_candidateBundles.requiredConditions} />
                            <BundleList />
                        </Fragment>
                    )
                )}
            </div>
        </div>
    )
}
