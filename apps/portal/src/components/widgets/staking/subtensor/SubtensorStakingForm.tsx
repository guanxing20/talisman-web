import type { ButtonProps } from '@talismn/ui/atoms/Button'
import type { SideSheetProps } from '@talismn/ui/molecules/SideSheet'
import type { ReactNode } from 'react'
import { useTheme } from '@emotion/react'
import { Button } from '@talismn/ui/atoms/Button'
import { CircularProgressIndicator } from '@talismn/ui/atoms/CircularProgressIndicator'
import { Surface } from '@talismn/ui/atoms/Surface'
import { Text } from '@talismn/ui/atoms/Text'
import { DescriptionList } from '@talismn/ui/molecules/DescriptionList'
import { ListItem } from '@talismn/ui/molecules/ListItem'
import { Select } from '@talismn/ui/molecules/Select'
import { SIDE_SHEET_WIDE_BREAK_POINT_SELECTOR, SideSheet } from '@talismn/ui/molecules/SideSheet'
import { TextInput } from '@talismn/ui/molecules/TextInput'
import { classNames } from '@talismn/util'
import { Zap } from '@talismn/web-icons'
import clsx from 'clsx'
import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'

import { cn } from '@/util/cn'
import { Maybe } from '@/util/monads'

import { StakeTxBreakdown } from './StakeTxBreakdown'

type AmountInputProps =
  | {
      disabled?: false
      amount: string
      onChangeAmount: (amount: string) => unknown
      onRequestMaxAmount: () => unknown
      assetSelector: ReactNode
      fiatAmount: ReactNode
      availableToStake: ReactNode
      error?: string
      isLoading: boolean
    }
  | {
      disabled: true
      assetSelector: ReactNode
    }

const AmountInput = (props: AmountInputProps) => {
  const theme = useTheme()
  return (
    <TextInput
      disabled={props.disabled}
      type="number"
      inputMode="decimal"
      placeholder="0.00"
      value={props.disabled ? undefined : props.amount}
      onChangeText={props.disabled ? undefined : props.onChangeAmount}
      leadingLabel="Available to stake"
      trailingLabel={props.disabled ? '...' : props.availableToStake}
      trailingIcon={props.assetSelector}
      leadingSupportingText={
        props.disabled
          ? ''
          : Maybe.of(props.isLoading ? undefined : props.error).mapOr(props.fiatAmount, x => (
              <TextInput.ErrorLabel>{x}</TextInput.ErrorLabel>
            ))
      }
      trailingSupportingText={
        <Button
          disabled={props.disabled}
          variant="surface"
          css={{ fontSize: theme.typography.bodySmall.fontSize, padding: '0.3rem 0.8rem' }}
          onClick={props.disabled ? undefined : props.onRequestMaxAmount}
        >
          Max
        </Button>
      }
      css={{ fontSize: '3rem' }}
    />
  )
}

export type SubtensorStakingFormProps = {
  accountSelector: ReactNode
  amountInput: ReactNode
  selectionInProgress?: boolean
  subnetSelectionInProgress?: boolean
  selectedName?: string
  selectedSubnetName?: string
  estimatedRewards: ReactNode
  currentStakedBalance?: ReactNode
  stakeButton: ReactNode
  isSelectSubnetDisabled: boolean
  onRequestChange: () => void
  onSelectSubnet: () => void
}

export const SubtensorStakingForm = (props: SubtensorStakingFormProps) => {
  const [searchParams] = useSearchParams()
  const hasDTaoStaking = searchParams.get('hasDTaoStaking') === 'true'
  const netuidParam = searchParams.get('netuid')

  const isValidatorSelectDisabled = hasDTaoStaking && !netuidParam

  return (
    <Surface
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.6rem',
        borderRadius: '1.6rem',
        padding: '1.6rem',
        width: 'auto',
      }}
    >
      {props.accountSelector}
      {props.amountInput}

      {hasDTaoStaking && (
        <div css={{ cursor: props.isSelectSubnetDisabled ? 'not-allowed' : 'pointer' }} onClick={props.onSelectSubnet}>
          <label css={{ pointerEvents: 'none' }}>
            <Text.BodySmall as="div" css={{ marginBottom: '0.8rem' }}>
              Select Subnet
            </Text.BodySmall>
            <Select
              loading={props.subnetSelectionInProgress}
              placeholder={<ListItem headlineContent="Select a subnet" css={{ padding: '0.8rem', paddingLeft: 0 }} />}
              renderSelected={() =>
                props.selectedSubnetName === undefined ? undefined : (
                  <ListItem headlineContent={props.selectedSubnetName} css={{ padding: '0.8rem', paddingLeft: 0 }} />
                )
              }
              css={{ width: '100%' }}
            />
          </label>
        </div>
      )}
      <div
        className={classNames(isValidatorSelectDisabled ? 'cursor-not-allowed' : 'cursor-pointer')}
        onClick={isValidatorSelectDisabled ? () => null : props.onRequestChange}
      >
        <label css={{ pointerEvents: 'none' }}>
          <Text.BodySmall as="div" css={{ marginBottom: '0.8rem' }}>
            Select Validator
          </Text.BodySmall>
          <Select
            loading={props.selectionInProgress}
            isDisabled
            placeholder={<ListItem headlineContent="Select a validator" css={{ padding: '0.8rem', paddingLeft: 0 }} />}
            renderSelected={() =>
              props.selectedName === undefined ? undefined : (
                <ListItem headlineContent={props.selectedName} css={{ padding: '0.8rem', paddingLeft: 0 }} />
              )
            }
            css={{ width: '100%' }}
          />
        </label>
      </div>
      {hasDTaoStaking && <StakeTxBreakdown />}
      <div className={clsx({ 'mb-[1.6rem] mt-[1.6rem]': props.currentStakedBalance !== undefined || !hasDTaoStaking })}>
        <DescriptionList>
          {props.currentStakedBalance !== undefined && (
            <DescriptionList.Description>
              <DescriptionList.Term>Already staked</DescriptionList.Term>
              <DescriptionList.Details>
                <Text css={{ color: '#38D448' }}>{props.currentStakedBalance}</Text>
              </DescriptionList.Details>
            </DescriptionList.Description>
          )}
          {!hasDTaoStaking && (
            <DescriptionList.Description>
              <DescriptionList.Term>Estimated earning</DescriptionList.Term>
              <DescriptionList.Details css={{ wordBreak: 'break-all' }}>
                {props.estimatedRewards}
              </DescriptionList.Details>
            </DescriptionList.Description>
          )}
        </DescriptionList>
      </div>
      {props.stakeButton}
    </Surface>
  )
}
SubtensorStakingForm.AmountInput = AmountInput
SubtensorStakingForm.StakeButton = (props: Omit<ButtonProps, 'children'>) => (
  <Button {...props} css={{ marginTop: '1.6rem', width: 'auto' }}>
    Stake
  </Button>
)

export type SubtensorStakingSideSheetProps = Omit<SideSheetProps, 'title'> & {
  chainName: ReactNode
  minimumStake: ReactNode
}
export const SubtensorStakingSideSheet = ({ children, minimumStake, ...props }: SubtensorStakingSideSheetProps) => {
  const [searchParams] = useSearchParams()
  const hasDTaoStaking = searchParams.get('hasDTaoStaking') === 'true'

  return (
    <SideSheet
      {...props}
      title={
        <div className="flex items-center gap-2">
          <Zap />
          Stake
        </div>
      }
      subtitle="Bittensor delegated staking"
    >
      <div css={{ [SIDE_SHEET_WIDE_BREAK_POINT_SELECTOR]: { minWidth: '42rem' } }}>
        {children}
        <div className={cn('mt-[2rem] flex flex-col gap-[1rem]', { 'mt-[6.4rem]': !hasDTaoStaking })}>
          <Text.Body as="p">Bittensor automatically reinvests your staking rewards.</Text.Body>
          {hasDTaoStaking && (
            <Text.Body as="p">
              Note that Dynamic TAO Subnet staking has more variable rewards than the Legacy TAO Staking.{' '}
              <Text.Body.A href="https://taostats.io/subnets" target="_blank">
                Learn more
              </Text.Body.A>
            </Text.Body>
          )}

          <Text.Body as="p">
            The <Text.Body alpha="high">minimum amount</Text.Body> required to stake is{' '}
            <Suspense fallback={<CircularProgressIndicator size="1em" />}>
              <Text.Body alpha="high">{minimumStake}</Text.Body>
            </Suspense>
            .
          </Text.Body>
        </div>
      </div>
    </SideSheet>
  )
}
