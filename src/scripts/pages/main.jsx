/**
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
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load States
import States from '@/scripts/states'

// Load Blocks
import RequiredConditionsBlock          from '@/scripts/components/block/requiredConditions'
import CandidateBundlesBlock            from '@/scripts/components/block/candidateBundles'
import PlayerEquipsBlock                from '@/scripts/components/block/playerEquips'
import PlayerStatusBlock                from '@/scripts/components/block/playerStatus'

// Load Styles
import '@/styles/pages/main.sass'

export default function MainPage () {
    return (
        <div className="mhc-page">
            <RequiredConditionsBlock />
            <CandidateBundlesBlock />
            <PlayerEquipsBlock />
            <PlayerStatusBlock />
        </div>
    )
}
