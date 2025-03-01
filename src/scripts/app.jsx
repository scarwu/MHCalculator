/**
 * Main Module
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
    Outlet,
    useLocation as useRouteLocation,
    useNavigate as useRouteNavigate,
    useParams as useRouteParams
} from 'react-router-dom'

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
import IconButton from '@/scripts/components/ui/iconButton'
import IconSelector from '@/scripts/components/ui/iconSelector'

// Load Models
import ChangeLogModal from '@/scripts/components/modal/changeLog'
import AlgorithmSettingModal from '@/scripts/components/modal/algorithmSetting'
import WeaponSelectorModal from '@/scripts/components/modal/weaponSelector'
import ArmorSelectorModal from '@/scripts/components/modal/armorSelector'
import CharmSelectorModal from '@/scripts/components/modal/charmSelector'
import DecorationSelectorModal from '@/scripts/components/modal/decorationSelector'
import PetalaceSelectorModal from '@/scripts/components/modal/petalaceSelector'
import SetSelectorModal from '@/scripts/components/modal/setSelector'
import SkillSelectorModal from '@/scripts/components/modal/skillSelector'
import EnhanceSelectorModal from '@/scripts/components/modal/enhanceSelector'
import RampageDecorationSelectorModal from '@/scripts/components/modal/rampageDecorationSelector'
import RampageSkillSelectorModal from '@/scripts/components/modal/rampageSkillSelector'

// Load Styles
import '@/styles/global.sass'
import '@/styles/ui.sass'
import '@/styles/app.sass'

if ('production' === Config.env) {
    if (Config.buildTime !== Status.get('state:buildTime')) {
        States.actions.showModal('changeLog')
    }

    Status.set('state:buildTime', Config.buildTime)
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
    let equips = Helper.deepCopy(States.getters.playerEquips())
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
    const _lang = States.hooks.useLang()
    const _series = States.hooks.useSeries()

    const routeParams = useRouteParams()
    const routeLocation = useRouteLocation()
    const routeNavigate = useRouteNavigate()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {

        // Restore Equips from Url to State
        if (Helper.isNotEmpty(routeParams['*']) && '' !== routeParams['*']) {
            let playerEquips = JSON.parse(Helper.base64Decode(routeParams['*']))

            // TODO: need verify

            States.actions.replacePlayerEquips(playerEquips)
        }
    }, [ routeParams ])

    /**
     * Handle Functions
     */
    const handleLangChange = useCallback((event) => {
        let lang = event.target.value

        States.actions.setLang(lang)

        routeNavigate(`/${lang}/${_series}`)

        window.location.reload()
    }, [ _series ])

    const handleSeriesChange = useCallback((event) => {
        let series = event.target.value

        States.actions.setSeries(series)

        routeNavigate(`/${_lang}/${series}`)

        window.location.reload()
    }, [ _lang ])

    /**
     * Render Functions
     */
    return (
        <div key={`${_lang}:${_series}`} id="mhc-app" className="container-fluid">
            <div className="mhc-header">
                <div className="mhc-icons_bundle-left">
                    <IconSelector
                        iconName="globe"
                        defaultValue={_lang} options={langList}
                        onChange={handleLangChange} />
                    <IconSelector
                        iconName="list"
                        defaultValue={_series} options={seriesList}
                        onChange={handleSeriesChange} />
                </div>

                <a className="mhc-title" href="./">
                    <h1>{_('title')}</h1>
                </a>

                <div className="mhc-icons_bundle-right">
                    <IconButton
                        iconName="link" altName={_('exportBundle')}
                        onClick={handlePlayerEquipsExport} />
                    <IconButton
                        iconName="info" altName={_('changeLog')}
                        onClick={() => { States.actions.showModal('changeLog') }} />
                    <IconButton
                        iconName="question" altName={_('readme')}
                        onClick={handleOpenReadme} />
                </div>
            </div>

            <div className="mhc-body">
                <Outlet />
            </div>

            <div className="mhc-footer">
                <div className="bh-top">
                    <span>Copyright (c) Scar Wu</span>
                </div>

                <div className="bh-bottom">
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
            <CharmSelectorModal />
            <DecorationSelectorModal />
            <PetalaceSelectorModal />
            <SetSelectorModal />
            <SkillSelectorModal />
            <EnhanceSelectorModal />
            <RampageDecorationSelectorModal />
            <RampageSkillSelectorModal />
        </div>
    )
}
