/**
 * Main Module
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useParams as useRouteParams } from 'react-router-dom'

// Load Config & Constant
import Config from '@/scripts/config'
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load States
import States from '@/scripts/states'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconSelector from '@/scripts/components/common/iconSelector'

import RequiredConditionsBlock from '@/scripts/components/block/requiredConditionsBlock'
import CandidateBundlesBlock from '@/scripts/components/block/candidateBundlesBlock'
import PlayerEquipsBlock from '@/scripts/components/block/playerEquipsBlock'
import PlayerStatusBlock from '@/scripts/components/block/playerStatusBlock'

import ChangeLogModal from '@/scripts/components/modal/changeLog'
import AlgorithmSettingModal from '@/scripts/components/modal/algorithmSetting'
import WeaponSelectorModal from '@/scripts/components/modal/weaponSelector'
import ArmorSelectorModal from '@/scripts/components/modal/armorSelector'
import PetalaceSelectorModal from '@/scripts/components/modal/petalaceSelector'
import SetSelectorModal from '@/scripts/components/modal/setSelector'
import SkillSelectorModal from '@/scripts/components/modal/skillSelector'
import DecorationSelectorModal from '@/scripts/components/modal/decorationSelector'
// import RampageDecorationSelectorModal from '@/scripts/components/modal/rampageDecorationSelector'
import RampageSkillSelectorModal from '@/scripts/components/modal/rampageSkillSelector'

if ('production' === Config.env) {
    if (Config.buildTime !== Status.get('sys:buildTime')) {
        States.setter.showModal('changeLog')
    }

    Status.set('sys:buildTime', Config.buildTime)
}

/**
 * Variables
 */
const langList = Object.keys(Constant.langs).map((lang) => {
    return {
        key: lang,
        value: Constant.langs[lang]
    }
})

const seriesList = [
    'wilds',
    'rise',
    'world'
].map((series) => {
    return {
        key: series,
        value: _('series:' + series)
    }
})

/**
 * Handle Functions
 */
const handlePlayerEquipsExport = () => {
    let equips = Helper.deepCopy(States.getter.getPlayerEquips())
    let hash = Helper.base64Encode(JSON.stringify(equips))

    let protocol = window.location.protocol
    let hostname = window.location.hostname
    let pathname = window.location.pathname

    window.open(`${protocol}//${hostname}${pathname}#/${hash}`, '_blank')
}

const handleOpenReadme = () => {
    window.open('https://scar.tw/article/2018/05/02/mhw-calculator-readme/','_blank')
}

export default function App () {

    /**
     * Hooks
     */
    const [stateLang, setLang] = useState(Status.get('sys:lang'))
    const [stateSeries, setSeries] = useState(Status.get('sys:series'))

    let routeParams = useRouteParams()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {

        // Restore Equips from Url to State
        if (Helper.isNotEmpty(routeParams['*']) && '' !== routeParams['*']) {
            let playerEquips = JSON.parse(Helper.base64Decode(routeParams['*']))

            // TODO: need verify

            States.setter.replacePlayerEquips(playerEquips)
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleLangChange = useCallback((event) => {
        Status.set('sys:lang', event.target.value)
        setLang(event.target.value)
    }, [])

    const handleSeriesChange = useCallback((event) => {
        Status.set('sys:series', event.target.value)
        setSeries(event.target.value)
    }, [])

    /**
     * Render Functions
     */
    return (
        <div key={stateLang} id="mhrc-app" className="container-fluid">
            <div className="mhrc-header">
                <div className="mhrc-icons_bundle-left">
                    <IconSelector
                        iconName="globe"
                        defaultValue={stateLang} options={langList}
                        onChange={handleLangChange} />
                    <IconSelector
                        iconName="list"
                        defaultValue={stateSeries} options={seriesList}
                        onChange={handleSeriesChange} />
                </div>

                <a className="mhrc-title" href="./">
                    <h1>{_('title')}</h1>
                </a>

                <div className="mhrc-icons_bundle-right">
                    <IconButton
                        iconName="link" altName={_('exportBundle')}
                        onClick={handlePlayerEquipsExport} />
                    <IconButton
                        iconName="info" altName={_('changeLog')}
                        onClick={() => { States.setter.showModal('changeLog') }} />
                    <IconButton
                        iconName="question" altName={_('readme')}
                        onClick={handleOpenReadme} />
                </div>
            </div>

            <div className="row mhrc-container">
                <RequiredConditionsBlock />
                <CandidateBundlesBlock />
                <PlayerEquipsBlock />
                <PlayerStatusBlock />
            </div>

            <div className="row mhrc-footer">
                <div className="col-12">
                    <span>Copyright (c) Scar Wu</span>
                </div>

                <div className="col-12">
                    <a href="//scar.tw" target="_blank">
                        <span>Blog</span>
                    </a>
                    &nbsp;|&nbsp;
                    <a href="https://github.com/scarwu/MHCalculator" target="_blank">
                        <span>Github</span>
                    </a>
                </div>
            </div>

            <ChangeLogModal />
            <AlgorithmSettingModal />
            <WeaponSelectorModal />
            <ArmorSelectorModal />
            <PetalaceSelectorModal />
            <SetSelectorModal />
            <DecorationSelectorModal />
            <SkillSelectorModal />
            {/* <RampageDecorationSelectorModal /> */}
            <RampageSkillSelectorModal />
        </div>
    )
}
