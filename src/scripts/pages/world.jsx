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

import ConditionOptionsBlock from 'components/block/world/requiredConditions'
import CandidateBundlesBlock from 'components/block/world/candidateBundles'
import EquipsDisplayerBlock from 'components/block/world/playerEquips'
import CharacterStatusBlock from 'components/block/world/playerStatus'

import AlgorithmSettingModal from 'components/modal/world/algorithmSetting'
import ConditionItemSelectorModal from 'components/modal/world/conditionItemSelector'
import EquipItemSelectorModal from 'components/modal/world/equipItemSelector'
import BundleItemSelectorModal from 'components/modal/world/bundleItemSelector'

// Load Styles
import '@/styles/pages/world.sass'

export default function WorldPage () {
    return (
        <div className="mhc-page mhc-world-page">
            <ConditionOptionsBlock />
            <CandidateBundlesBlock />
            <EquipsDisplayerBlock />
            <CharacterStatusBlock />

            <AlgorithmSettingModal />
            <ConditionItemSelectorModal />
            <EquipItemSelectorModal />
            <BundleItemSelectorModal />
        </div>
    )
}
