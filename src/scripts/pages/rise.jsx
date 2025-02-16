/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Config & Constant
import Config from '@/scripts/config'
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load States
import States from '@/scripts/states'

import RequiredConditionsBlock  from '@/scripts/components/block/rise/requiredConditions'
import CandidateBundlesBlock    from '@/scripts/components/block/rise/candidateBundles'
import PlayerEquipsBlock        from '@/scripts/components/block/rise/playerEquips'
import PlayerStatusBlock        from '@/scripts/components/block/rise/playerStatus'

import AlgorithmSettingModal    from '@/scripts/components/modal/rise/algorithmSetting'
import WeaponSelectorModal      from '@/scripts/components/modal/rise/weaponSelector'
import ArmorSelectorModal       from '@/scripts/components/modal/rise/armorSelector'
import PetalaceSelectorModal    from '@/scripts/components/modal/rise/petalaceSelector'
import SetSelectorModal         from '@/scripts/components/modal/rise/setSelector'
import SkillSelectorModal       from '@/scripts/components/modal/rise/skillSelector'
import DecorationSelectorModal  from '@/scripts/components/modal/rise/decorationSelector'
// import RampageDecorationSelectorModal from '@/scripts/components/modal/rise/rampageDecorationSelector'
import RampageSkillSelectorModal from '@/scripts/components/modal/rise/rampageSkillSelector'

// Load Styles
import '@/styles/pages/rise.sass'

export default function RisePage () {
    return (
        <div className="mhc-page mhc-rise-page">
            <RequiredConditionsBlock />
            <CandidateBundlesBlock />
            <PlayerEquipsBlock />
            <PlayerStatusBlock />

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
