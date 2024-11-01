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

export default function RisePage () {
    return (
        <div>
            <RequiredConditionsBlock />
            <CandidateBundlesBlock />
            <PlayerEquipsBlock />
            <PlayerStatusBlock />

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
