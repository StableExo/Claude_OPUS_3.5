// Sources flattened with hardhat v3.0.16 https://hardhat.org

// SPDX-License-Identifier: GPL-2.0-or-later AND MIT AND UNLICENSED

pragma abicoder v2;

// File npm/@openzeppelin/contracts@5.4.0/token/ERC20/IERC20.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File npm/@openzeppelin/contracts@5.4.0/utils/introspection/IERC165.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File npm/@openzeppelin/contracts@5.4.0/interfaces/IERC165.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

pragma solidity >=0.4.16;


// File npm/@openzeppelin/contracts@5.4.0/interfaces/IERC20.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

pragma solidity >=0.4.16;


// File npm/@openzeppelin/contracts@5.4.0/interfaces/IERC1363.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

pragma solidity >=0.6.2;


/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}


// File npm/@openzeppelin/contracts@5.4.0/token/ERC20/utils/SafeERC20.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.20;


/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}


// File npm/@openzeppelin/contracts@5.4.0/utils/ReentrancyGuard.sol

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/callback/IUniswapV3FlashCallback.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Callback for IUniswapV3PoolActions#flash
/// @notice Any contract that calls IUniswapV3PoolActions#flash must implement this interface
interface IUniswapV3FlashCallback {
    /// @notice Called to `msg.sender` after transferring to the recipient from IUniswapV3Pool#flash.
    /// @dev In the implementation you must repay the pool the tokens sent by flash plus the computed fee amounts.
    /// The caller of this method must be checked to be a UniswapV3Pool deployed by the canonical UniswapV3Factory.
    /// @param fee0 The fee amount in token0 due to the pool by the end of the flash
    /// @param fee1 The fee amount in token1 due to the pool by the end of the flash
    /// @param data Any data passed through by the caller via the IUniswapV3PoolActions#flash call
    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external;
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/IUniswapV3Factory.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title The interface for the Uniswap V3 Factory
/// @notice The Uniswap V3 Factory facilitates creation of Uniswap V3 pools and control over the protocol fees
interface IUniswapV3Factory {
    /// @notice Emitted when the owner of the factory is changed
    /// @param oldOwner The owner before the owner was changed
    /// @param newOwner The owner after the owner was changed
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    /// @notice Emitted when a pool is created
    /// @param token0 The first token of the pool by address sort order
    /// @param token1 The second token of the pool by address sort order
    /// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @param tickSpacing The minimum number of ticks between initialized ticks
    /// @param pool The address of the created pool
    event PoolCreated(
        address indexed token0,
        address indexed token1,
        uint24 indexed fee,
        int24 tickSpacing,
        address pool
    );

    /// @notice Emitted when a new fee amount is enabled for pool creation via the factory
    /// @param fee The enabled fee, denominated in hundredths of a bip
    /// @param tickSpacing The minimum number of ticks between initialized ticks for pools created with the given fee
    event FeeAmountEnabled(uint24 indexed fee, int24 indexed tickSpacing);

    /// @notice Returns the current owner of the factory
    /// @dev Can be changed by the current owner via setOwner
    /// @return The address of the factory owner
    function owner() external view returns (address);

    /// @notice Returns the tick spacing for a given fee amount, if enabled, or 0 if not enabled
    /// @dev A fee amount can never be removed, so this value should be hard coded or cached in the calling context
    /// @param fee The enabled fee, denominated in hundredths of a bip. Returns 0 in case of unenabled fee
    /// @return The tick spacing
    function feeAmountTickSpacing(uint24 fee) external view returns (int24);

    /// @notice Returns the pool address for a given pair of tokens and a fee, or address 0 if it does not exist
    /// @dev tokenA and tokenB may be passed in either token0/token1 or token1/token0 order
    /// @param tokenA The contract address of either token0 or token1
    /// @param tokenB The contract address of the other token
    /// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @return pool The pool address
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool);

    /// @notice Creates a pool for the given two tokens and fee
    /// @param tokenA One of the two tokens in the desired pool
    /// @param tokenB The other of the two tokens in the desired pool
    /// @param fee The desired fee for the pool
    /// @dev tokenA and tokenB may be passed in either order: token0/token1 or token1/token0. tickSpacing is retrieved
    /// from the fee. The call will revert if the pool already exists, the fee is invalid, or the token arguments
    /// are invalid.
    /// @return pool The address of the newly created pool
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool);

    /// @notice Updates the owner of the factory
    /// @dev Must be called by the current owner
    /// @param _owner The new owner of the factory
    function setOwner(address _owner) external;

    /// @notice Enables a fee amount with the given tickSpacing
    /// @dev Fee amounts may never be removed once enabled
    /// @param fee The fee amount to enable, denominated in hundredths of a bip (i.e. 1e-6)
    /// @param tickSpacing The spacing between ticks to be enforced for all pools created with the given fee amount
    function enableFeeAmount(uint24 fee, int24 tickSpacing) external;
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/pool/IUniswapV3PoolActions.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Permissionless pool actions
/// @notice Contains pool methods that can be called by anyone
interface IUniswapV3PoolActions {
    /// @notice Sets the initial price for the pool
    /// @dev Price is represented as a sqrt(amountToken1/amountToken0) Q64.96 value
    /// @param sqrtPriceX96 the initial sqrt price of the pool as a Q64.96
    function initialize(uint160 sqrtPriceX96) external;

    /// @notice Adds liquidity for the given recipient/tickLower/tickUpper position
    /// @dev The caller of this method receives a callback in the form of IUniswapV3MintCallback#uniswapV3MintCallback
    /// in which they must pay any token0 or token1 owed for the liquidity. The amount of token0/token1 due depends
    /// on tickLower, tickUpper, the amount of liquidity, and the current price.
    /// @param recipient The address for which the liquidity will be created
    /// @param tickLower The lower tick of the position in which to add liquidity
    /// @param tickUpper The upper tick of the position in which to add liquidity
    /// @param amount The amount of liquidity to mint
    /// @param data Any data that should be passed through to the callback
    /// @return amount0 The amount of token0 that was paid to mint the given amount of liquidity. Matches the value in the callback
    /// @return amount1 The amount of token1 that was paid to mint the given amount of liquidity. Matches the value in the callback
    function mint(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        bytes calldata data
    ) external returns (uint256 amount0, uint256 amount1);

    /// @notice Collects tokens owed to a position
    /// @dev Does not recompute fees earned, which must be done either via mint or burn of any amount of liquidity.
    /// Collect must be called by the position owner. To withdraw only token0 or only token1, amount0Requested or
    /// amount1Requested may be set to zero. To withdraw all tokens owed, caller may pass any value greater than the
    /// actual tokens owed, e.g. type(uint128).max. Tokens owed may be from accumulated swap fees or burned liquidity.
    /// @param recipient The address which should receive the fees collected
    /// @param tickLower The lower tick of the position for which to collect fees
    /// @param tickUpper The upper tick of the position for which to collect fees
    /// @param amount0Requested How much token0 should be withdrawn from the fees owed
    /// @param amount1Requested How much token1 should be withdrawn from the fees owed
    /// @return amount0 The amount of fees collected in token0
    /// @return amount1 The amount of fees collected in token1
    function collect(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount0Requested,
        uint128 amount1Requested
    ) external returns (uint128 amount0, uint128 amount1);

    /// @notice Burn liquidity from the sender and account tokens owed for the liquidity to the position
    /// @dev Can be used to trigger a recalculation of fees owed to a position by calling with an amount of 0
    /// @dev Fees must be collected separately via a call to #collect
    /// @param tickLower The lower tick of the position for which to burn liquidity
    /// @param tickUpper The upper tick of the position for which to burn liquidity
    /// @param amount How much liquidity to burn
    /// @return amount0 The amount of token0 sent to the recipient
    /// @return amount1 The amount of token1 sent to the recipient
    function burn(
        int24 tickLower,
        int24 tickUpper,
        uint128 amount
    ) external returns (uint256 amount0, uint256 amount1);

    /// @notice Swap token0 for token1, or token1 for token0
    /// @dev The caller of this method receives a callback in the form of IUniswapV3SwapCallback#uniswapV3SwapCallback
    /// @param recipient The address to receive the output of the swap
    /// @param zeroForOne The direction of the swap, true for token0 to token1, false for token1 to token0
    /// @param amountSpecified The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative)
    /// @param sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this
    /// value after the swap. If one for zero, the price cannot be greater than this value after the swap
    /// @param data Any data to be passed through to the callback
    /// @return amount0 The delta of the balance of token0 of the pool, exact when negative, minimum when positive
    /// @return amount1 The delta of the balance of token1 of the pool, exact when negative, minimum when positive
    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);

    /// @notice Receive token0 and/or token1 and pay it back, plus a fee, in the callback
    /// @dev The caller of this method receives a callback in the form of IUniswapV3FlashCallback#uniswapV3FlashCallback
    /// @dev Can be used to donate underlying tokens pro-rata to currently in-range liquidity providers by calling
    /// with 0 amount{0,1} and sending the donation amount(s) from the callback
    /// @param recipient The address which will receive the token0 and token1 amounts
    /// @param amount0 The amount of token0 to send
    /// @param amount1 The amount of token1 to send
    /// @param data Any data to be passed through to the callback
    function flash(
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external;

    /// @notice Increase the maximum number of price and liquidity observations that this pool will store
    /// @dev This method is no-op if the pool already has an observationCardinalityNext greater than or equal to
    /// the input observationCardinalityNext.
    /// @param observationCardinalityNext The desired minimum number of observations for the pool to store
    function increaseObservationCardinalityNext(uint16 observationCardinalityNext) external;
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/pool/IUniswapV3PoolDerivedState.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Pool state that is not stored
/// @notice Contains view functions to provide information about the pool that is computed rather than stored on the
/// blockchain. The functions here may have variable gas costs.
interface IUniswapV3PoolDerivedState {
    /// @notice Returns the cumulative tick and liquidity as of each timestamp `secondsAgo` from the current block timestamp
    /// @dev To get a time weighted average tick or liquidity-in-range, you must call this with two values, one representing
    /// the beginning of the period and another for the end of the period. E.g., to get the last hour time-weighted average tick,
    /// you must call it with secondsAgos = [3600, 0].
    /// @dev The time weighted average tick represents the geometric time weighted average price of the pool, in
    /// log base sqrt(1.0001) of token1 / token0. The TickMath library can be used to go from a tick value to a ratio.
    /// @param secondsAgos From how long ago each cumulative tick and liquidity value should be returned
    /// @return tickCumulatives Cumulative tick values as of each `secondsAgos` from the current block timestamp
    /// @return secondsPerLiquidityCumulativeX128s Cumulative seconds per liquidity-in-range value as of each `secondsAgos` from the current block
    /// timestamp
    function observe(uint32[] calldata secondsAgos)
        external
        view
        returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s);

    /// @notice Returns a snapshot of the tick cumulative, seconds per liquidity and seconds inside a tick range
    /// @dev Snapshots must only be compared to other snapshots, taken over a period for which a position existed.
    /// I.e., snapshots cannot be compared if a position is not held for the entire period between when the first
    /// snapshot is taken and the second snapshot is taken.
    /// @param tickLower The lower tick of the range
    /// @param tickUpper The upper tick of the range
    /// @return tickCumulativeInside The snapshot of the tick accumulator for the range
    /// @return secondsPerLiquidityInsideX128 The snapshot of seconds per liquidity for the range
    /// @return secondsInside The snapshot of seconds per liquidity for the range
    function snapshotCumulativesInside(int24 tickLower, int24 tickUpper)
        external
        view
        returns (
            int56 tickCumulativeInside,
            uint160 secondsPerLiquidityInsideX128,
            uint32 secondsInside
        );
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/pool/IUniswapV3PoolEvents.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Events emitted by a pool
/// @notice Contains all events emitted by the pool
interface IUniswapV3PoolEvents {
    /// @notice Emitted exactly once by a pool when #initialize is first called on the pool
    /// @dev Mint/Burn/Swap cannot be emitted by the pool before Initialize
    /// @param sqrtPriceX96 The initial sqrt price of the pool, as a Q64.96
    /// @param tick The initial tick of the pool, i.e. log base 1.0001 of the starting price of the pool
    event Initialize(uint160 sqrtPriceX96, int24 tick);

    /// @notice Emitted when liquidity is minted for a given position
    /// @param sender The address that minted the liquidity
    /// @param owner The owner of the position and recipient of any minted liquidity
    /// @param tickLower The lower tick of the position
    /// @param tickUpper The upper tick of the position
    /// @param amount The amount of liquidity minted to the position range
    /// @param amount0 How much token0 was required for the minted liquidity
    /// @param amount1 How much token1 was required for the minted liquidity
    event Mint(
        address sender,
        address indexed owner,
        int24 indexed tickLower,
        int24 indexed tickUpper,
        uint128 amount,
        uint256 amount0,
        uint256 amount1
    );

    /// @notice Emitted when fees are collected by the owner of a position
    /// @dev Collect events may be emitted with zero amount0 and amount1 when the caller chooses not to collect fees
    /// @param owner The owner of the position for which fees are collected
    /// @param tickLower The lower tick of the position
    /// @param tickUpper The upper tick of the position
    /// @param amount0 The amount of token0 fees collected
    /// @param amount1 The amount of token1 fees collected
    event Collect(
        address indexed owner,
        address recipient,
        int24 indexed tickLower,
        int24 indexed tickUpper,
        uint128 amount0,
        uint128 amount1
    );

    /// @notice Emitted when a position's liquidity is removed
    /// @dev Does not withdraw any fees earned by the liquidity position, which must be withdrawn via #collect
    /// @param owner The owner of the position for which liquidity is removed
    /// @param tickLower The lower tick of the position
    /// @param tickUpper The upper tick of the position
    /// @param amount The amount of liquidity to remove
    /// @param amount0 The amount of token0 withdrawn
    /// @param amount1 The amount of token1 withdrawn
    event Burn(
        address indexed owner,
        int24 indexed tickLower,
        int24 indexed tickUpper,
        uint128 amount,
        uint256 amount0,
        uint256 amount1
    );

    /// @notice Emitted by the pool for any swaps between token0 and token1
    /// @param sender The address that initiated the swap call, and that received the callback
    /// @param recipient The address that received the output of the swap
    /// @param amount0 The delta of the token0 balance of the pool
    /// @param amount1 The delta of the token1 balance of the pool
    /// @param sqrtPriceX96 The sqrt(price) of the pool after the swap, as a Q64.96
    /// @param liquidity The liquidity of the pool after the swap
    /// @param tick The log base 1.0001 of price of the pool after the swap
    event Swap(
        address indexed sender,
        address indexed recipient,
        int256 amount0,
        int256 amount1,
        uint160 sqrtPriceX96,
        uint128 liquidity,
        int24 tick
    );

    /// @notice Emitted by the pool for any flashes of token0/token1
    /// @param sender The address that initiated the swap call, and that received the callback
    /// @param recipient The address that received the tokens from flash
    /// @param amount0 The amount of token0 that was flashed
    /// @param amount1 The amount of token1 that was flashed
    /// @param paid0 The amount of token0 paid for the flash, which can exceed the amount0 plus the fee
    /// @param paid1 The amount of token1 paid for the flash, which can exceed the amount1 plus the fee
    event Flash(
        address indexed sender,
        address indexed recipient,
        uint256 amount0,
        uint256 amount1,
        uint256 paid0,
        uint256 paid1
    );

    /// @notice Emitted by the pool for increases to the number of observations that can be stored
    /// @dev observationCardinalityNext is not the observation cardinality until an observation is written at the index
    /// just before a mint/swap/burn.
    /// @param observationCardinalityNextOld The previous value of the next observation cardinality
    /// @param observationCardinalityNextNew The updated value of the next observation cardinality
    event IncreaseObservationCardinalityNext(
        uint16 observationCardinalityNextOld,
        uint16 observationCardinalityNextNew
    );

    /// @notice Emitted when the protocol fee is changed by the pool
    /// @param feeProtocol0Old The previous value of the token0 protocol fee
    /// @param feeProtocol1Old The previous value of the token1 protocol fee
    /// @param feeProtocol0New The updated value of the token0 protocol fee
    /// @param feeProtocol1New The updated value of the token1 protocol fee
    event SetFeeProtocol(uint8 feeProtocol0Old, uint8 feeProtocol1Old, uint8 feeProtocol0New, uint8 feeProtocol1New);

    /// @notice Emitted when the collected protocol fees are withdrawn by the factory owner
    /// @param sender The address that collects the protocol fees
    /// @param recipient The address that receives the collected protocol fees
    /// @param amount0 The amount of token0 protocol fees that is withdrawn
    /// @param amount0 The amount of token1 protocol fees that is withdrawn
    event CollectProtocol(address indexed sender, address indexed recipient, uint128 amount0, uint128 amount1);
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/pool/IUniswapV3PoolImmutables.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Pool state that never changes
/// @notice These parameters are fixed for a pool forever, i.e., the methods will always return the same values
interface IUniswapV3PoolImmutables {
    /// @notice The contract that deployed the pool, which must adhere to the IUniswapV3Factory interface
    /// @return The contract address
    function factory() external view returns (address);

    /// @notice The first of the two tokens of the pool, sorted by address
    /// @return The token contract address
    function token0() external view returns (address);

    /// @notice The second of the two tokens of the pool, sorted by address
    /// @return The token contract address
    function token1() external view returns (address);

    /// @notice The pool's fee in hundredths of a bip, i.e. 1e-6
    /// @return The fee
    function fee() external view returns (uint24);

    /// @notice The pool tick spacing
    /// @dev Ticks can only be used at multiples of this value, minimum of 1 and always positive
    /// e.g.: a tickSpacing of 3 means ticks can be initialized every 3rd tick, i.e., ..., -6, -3, 0, 3, 6, ...
    /// This value is an int24 to avoid casting even though it is always positive.
    /// @return The tick spacing
    function tickSpacing() external view returns (int24);

    /// @notice The maximum amount of position liquidity that can use any tick in the range
    /// @dev This parameter is enforced per tick to prevent liquidity from overflowing a uint128 at any point, and
    /// also prevents out-of-range liquidity from being used to prevent adding in-range liquidity to a pool
    /// @return The max amount of liquidity per tick
    function maxLiquidityPerTick() external view returns (uint128);
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/pool/IUniswapV3PoolOwnerActions.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Permissioned pool actions
/// @notice Contains pool methods that may only be called by the factory owner
interface IUniswapV3PoolOwnerActions {
    /// @notice Set the denominator of the protocol's % share of the fees
    /// @param feeProtocol0 new protocol fee for token0 of the pool
    /// @param feeProtocol1 new protocol fee for token1 of the pool
    function setFeeProtocol(uint8 feeProtocol0, uint8 feeProtocol1) external;

    /// @notice Collect the protocol fee accrued to the pool
    /// @param recipient The address to which collected protocol fees should be sent
    /// @param amount0Requested The maximum amount of token0 to send, can be 0 to collect fees in only token1
    /// @param amount1Requested The maximum amount of token1 to send, can be 0 to collect fees in only token0
    /// @return amount0 The protocol fee collected in token0
    /// @return amount1 The protocol fee collected in token1
    function collectProtocol(
        address recipient,
        uint128 amount0Requested,
        uint128 amount1Requested
    ) external returns (uint128 amount0, uint128 amount1);
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/pool/IUniswapV3PoolState.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Pool state that can change
/// @notice These methods compose the pool's state, and can change with any frequency including multiple times
/// per transaction
interface IUniswapV3PoolState {
    /// @notice The 0th storage slot in the pool stores many values, and is exposed as a single method to save gas
    /// when accessed externally.
    /// @return sqrtPriceX96 The current price of the pool as a sqrt(token1/token0) Q64.96 value
    /// tick The current tick of the pool, i.e. according to the last tick transition that was run.
    /// This value may not always be equal to SqrtTickMath.getTickAtSqrtRatio(sqrtPriceX96) if the price is on a tick
    /// boundary.
    /// observationIndex The index of the last oracle observation that was written,
    /// observationCardinality The current maximum number of observations stored in the pool,
    /// observationCardinalityNext The next maximum number of observations, to be updated when the observation.
    /// feeProtocol The protocol fee for both tokens of the pool.
    /// Encoded as two 4 bit values, where the protocol fee of token1 is shifted 4 bits and the protocol fee of token0
    /// is the lower 4 bits. Used as the denominator of a fraction of the swap fee, e.g. 4 means 1/4th of the swap fee.
    /// unlocked Whether the pool is currently locked to reentrancy
    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );

    /// @notice The fee growth as a Q128.128 fees of token0 collected per unit of liquidity for the entire life of the pool
    /// @dev This value can overflow the uint256
    function feeGrowthGlobal0X128() external view returns (uint256);

    /// @notice The fee growth as a Q128.128 fees of token1 collected per unit of liquidity for the entire life of the pool
    /// @dev This value can overflow the uint256
    function feeGrowthGlobal1X128() external view returns (uint256);

    /// @notice The amounts of token0 and token1 that are owed to the protocol
    /// @dev Protocol fees will never exceed uint128 max in either token
    function protocolFees() external view returns (uint128 token0, uint128 token1);

    /// @notice The currently in range liquidity available to the pool
    /// @dev This value has no relationship to the total liquidity across all ticks
    function liquidity() external view returns (uint128);

    /// @notice Look up information about a specific tick in the pool
    /// @param tick The tick to look up
    /// @return liquidityGross the total amount of position liquidity that uses the pool either as tick lower or
    /// tick upper,
    /// liquidityNet how much liquidity changes when the pool price crosses the tick,
    /// feeGrowthOutside0X128 the fee growth on the other side of the tick from the current tick in token0,
    /// feeGrowthOutside1X128 the fee growth on the other side of the tick from the current tick in token1,
    /// tickCumulativeOutside the cumulative tick value on the other side of the tick from the current tick
    /// secondsPerLiquidityOutsideX128 the seconds spent per liquidity on the other side of the tick from the current tick,
    /// secondsOutside the seconds spent on the other side of the tick from the current tick,
    /// initialized Set to true if the tick is initialized, i.e. liquidityGross is greater than 0, otherwise equal to false.
    /// Outside values can only be used if the tick is initialized, i.e. if liquidityGross is greater than 0.
    /// In addition, these values are only relative and must be used only in comparison to previous snapshots for
    /// a specific position.
    function ticks(int24 tick)
        external
        view
        returns (
            uint128 liquidityGross,
            int128 liquidityNet,
            uint256 feeGrowthOutside0X128,
            uint256 feeGrowthOutside1X128,
            int56 tickCumulativeOutside,
            uint160 secondsPerLiquidityOutsideX128,
            uint32 secondsOutside,
            bool initialized
        );

    /// @notice Returns 256 packed tick initialized boolean values. See TickBitmap for more information
    function tickBitmap(int16 wordPosition) external view returns (uint256);

    /// @notice Returns the information about a position by the position's key
    /// @param key The position's key is a hash of a preimage composed by the owner, tickLower and tickUpper
    /// @return _liquidity The amount of liquidity in the position,
    /// Returns feeGrowthInside0LastX128 fee growth of token0 inside the tick range as of the last mint/burn/poke,
    /// Returns feeGrowthInside1LastX128 fee growth of token1 inside the tick range as of the last mint/burn/poke,
    /// Returns tokensOwed0 the computed amount of token0 owed to the position as of the last mint/burn/poke,
    /// Returns tokensOwed1 the computed amount of token1 owed to the position as of the last mint/burn/poke
    function positions(bytes32 key)
        external
        view
        returns (
            uint128 _liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        );

    /// @notice Returns data about a specific observation index
    /// @param index The element of the observations array to fetch
    /// @dev You most likely want to use #observe() instead of this method to get an observation as of some amount of time
    /// ago, rather than at a specific index in the array.
    /// @return blockTimestamp The timestamp of the observation,
    /// Returns tickCumulative the tick multiplied by seconds elapsed for the life of the pool as of the observation timestamp,
    /// Returns secondsPerLiquidityCumulativeX128 the seconds per in range liquidity for the life of the pool as of the observation timestamp,
    /// Returns initialized whether the observation has been initialized and the values are safe to use
    function observations(uint256 index)
        external
        view
        returns (
            uint32 blockTimestamp,
            int56 tickCumulative,
            uint160 secondsPerLiquidityCumulativeX128,
            bool initialized
        );
}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/IUniswapV3Pool.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;






/// @title The interface for a Uniswap V3 Pool
/// @notice A Uniswap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IUniswapV3Pool is
    IUniswapV3PoolImmutables,
    IUniswapV3PoolState,
    IUniswapV3PoolDerivedState,
    IUniswapV3PoolActions,
    IUniswapV3PoolOwnerActions,
    IUniswapV3PoolEvents
{

}


// File npm/@uniswap/v3-core@1.0.1/contracts/interfaces/callback/IUniswapV3SwapCallback.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Callback for IUniswapV3PoolActions#swap
/// @notice Any contract that calls IUniswapV3PoolActions#swap must implement this interface
interface IUniswapV3SwapCallback {
    /// @notice Called to `msg.sender` after executing a swap via IUniswapV3Pool#swap.
    /// @dev In the implementation you must pay the pool tokens owed for the swap.
    /// The caller of this method must be checked to be a UniswapV3Pool deployed by the canonical UniswapV3Factory.
    /// amount0Delta and amount1Delta can both be 0 if no tokens were swapped.
    /// @param amount0Delta The amount of token0 that was sent (negative) or must be received (positive) by the pool by
    /// the end of the swap. If positive, the callback must send that amount of token0 to the pool.
    /// @param amount1Delta The amount of token1 that was sent (negative) or must be received (positive) by the pool by
    /// the end of the swap. If positive, the callback must send that amount of token1 to the pool.
    /// @param data Any data passed through by the caller via the IUniswapV3PoolActions#swap call
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external;
}


// File npm/@uniswap/v3-periphery@1.4.4/contracts/interfaces/ISwapRouter.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;
// Original pragma directive: pragma abicoder v2

/// @title Router token swapping functionality
/// @notice Functions for swapping tokens via Uniswap V3
interface ISwapRouter is IUniswapV3SwapCallback {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another along the specified path
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactInputParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);

    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps as little as possible of one token for `amountOut` of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactOutputSingleParams` in calldata
    /// @return amountIn The amount of the input token
    function exactOutputSingle(ExactOutputSingleParams calldata params) external payable returns (uint256 amountIn);

    struct ExactOutputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
    }

    /// @notice Swaps as little as possible of one token for `amountOut` of another along the specified path (reversed)
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactOutputParams` in calldata
    /// @return amountIn The amount of the input token
    function exactOutput(ExactOutputParams calldata params) external payable returns (uint256 amountIn);
}


// File contracts/interfaces/IDODOV1V2Pool.sol

// contracts/interfaces/IDODOV1V2Pool.sol
// Original license: SPDX_License_Identifier: UNLICENSED
// --- VERSION v1.1 --- Added buyBaseToken

pragma solidity >=0.7.0;

interface IDODOV1V2Pool {
    // --- Swap Functions Needed ---
    function sellBaseToken(uint256 amount, uint256 minReceiveQuote, bytes calldata data) external returns (uint256 receiveQuoteAmount);
    // Added buyBaseToken for selling quote tokens
    function buyBaseToken(uint256 amount, uint256 maxPayQuote, bytes calldata data) external returns (uint256 payQuoteAmount);

    // --- View Functions Needed ---
    function _BASE_TOKEN_() external view returns (address);
    // Add _QUOTE_TOKEN_ if needed for logic later
    // function _QUOTE_TOKEN_() external view returns (address);
}


// File contracts/interfaces/IUniswapV2Router02.sol

// contracts/interfaces/IUniswapV2Router02.sol
// Original license: SPDX_License_Identifier: UNLICENSED
pragma solidity >=0.6.2;

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}


// File contracts/libraries/PoolAddress.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

/// @title Provides functions for deriving a pool address from the factory, tokens, and the fee
library PoolAddress {
    bytes32 internal constant POOL_INIT_CODE_HASH = 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54;

    /// @notice The identifying key of the pool
    struct PoolKey {
        address token0;
        address token1;
        uint24 fee;
    }

    /// @notice Returns PoolKey: the ordered tokens with the matched fee levels
    /// @param tokenA The first token of a pool, unsorted
    /// @param tokenB The second token of a pool, unsorted
    /// @param fee The fee level of the pool
    /// @return Poolkey The pool details with ordered token0 and token1 assignments
    function getPoolKey(
        address tokenA,
        address tokenB,
        uint24 fee
    ) internal pure returns (PoolKey memory) {
        if (tokenA > tokenB) (tokenA, tokenB) = (tokenB, tokenA);
        return PoolKey({token0: tokenA, token1: tokenB, fee: fee});
    }

    /// @notice Deterministically computes the pool address given the factory and PoolKey
    /// @param factory The Uniswap V3 factory contract address
    /// @param key The PoolKey
    /// @return pool The contract address of the V3 pool
    function computeAddress(address factory, PoolKey memory key) internal pure returns (address pool) {
        require(key.token0 < key.token1);
        pool = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex'ff',
                            factory,
                            keccak256(abi.encode(key.token0, key.token1, key.fee)),
                            POOL_INIT_CODE_HASH
                        )
                    )
                )
            )
        );
    }
}


// File contracts/libraries/CallbackValidation.sol

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;


/// @notice Provides validation for callbacks from Uniswap V3 Pools
library CallbackValidation {
    /// @notice Returns the address of a valid Uniswap V3 Pool
    /// @param factory The contract address of the Uniswap V3 factory
    /// @param tokenA The contract address of either token0 or token1
    /// @param tokenB The contract address of the other token
    /// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @return pool The V3 pool contract address
    function verifyCallback(
        address factory,
        address tokenA,
        address tokenB,
        uint24 fee
    ) internal view returns (IUniswapV3Pool pool) {
        return verifyCallback(factory, PoolAddress.getPoolKey(tokenA, tokenB, fee));
    }

    /// @notice Returns the address of a valid Uniswap V3 Pool
    /// @param factory The contract address of the Uniswap V3 factory
    /// @param poolKey The identifying key of the V3 pool
    /// @return pool The V3 pool contract address
    function verifyCallback(address factory, PoolAddress.PoolKey memory poolKey)
        internal
        view
        returns (IUniswapV3Pool pool)
    {
        pool = IUniswapV3Pool(PoolAddress.computeAddress(factory, poolKey));
        require(msg.sender == address(pool));
    }
}


// File contracts/FlashSwapV2.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.20; // Match periphery library version
// Original pragma directive: pragma abicoder v2 // Use ABI v2 for complex structs/arrays

// --- Imports ---


}

interface IFlashLoanReceiver { // Aave V3 Flash Loan Receiver interface
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external returns (bool);

    function addressesProvider() external view returns (address);
    function pool() external view returns (address);
}


// --- Contract Definition ---
// --- VERSION v4.1 (FlashSwapV2 + Tithe) --- Adapted for Base Network. Includes The 70/30 Split tithe system.
// 
// The 70/30 Split: Automated profit allocation for US debt reduction
//   - 70% of net profits → titheRecipient (US debt reduction wallet)
//   - 30% of net profits → owner (operator share)
//
// NOTE: Compilation may show warnings from @openzeppelin/contracts v3.4.2-solc-0.7 ReentrancyGuard 
// about constructor visibility. This is expected and safe - it's a deprecation warning in the 
// OpenZeppelin library itself (not our code). The warning will be resolved when upgrading to 
// OpenZeppelin v4+ in the future (requires Solidity 0.8+).
//
contract FlashSwapV2 is IUniswapV3FlashCallback, IFlashLoanReceiver, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- State Variables ---
    ISwapRouter public immutable swapRouter; // Uniswap V3 Swap Router
    IUniswapV2Router02 public immutable sushiRouter; // SushiSwap Router (V2 compatible)
    address payable public immutable owner; // The contract deployer/owner (receives 30% operator share)
    address payable public immutable titheRecipient; // Tithe wallet (receives 70% for US debt reduction)
    uint16 public immutable titheBps; // Tithe percentage in basis points (7000 = 70%)
    address public immutable v3Factory = 0x33128a8fC17869897dcE68Ed026d694621f6FDfD; // Uniswap V3 Factory Address (Base Mainnet)
    IPool public immutable aavePool; // Aave V3 Pool contract instance
    address public immutable aaveAddressesProvider; // Aave Addresses Provider address
    uint constant DEADLINE_OFFSET = 60; // Swap deadline in seconds from block.timestamp (e.g., 60 seconds)
    uint16 constant MAX_TITHE_BPS = 9000; // Maximum 90% tithe allocation (allows flexibility for testing)


    // --- DEX Type Constants ---
    uint8 constant DEX_TYPE_UNISWAP_V3 = 0;
    uint8 constant DEX_TYPE_SUSHISWAP = 1;
    uint8 constant DEX_TYPE_DODO = 2; // Kept for code structure


    // --- Structs ---
    enum CallbackType { TWO_HOP, TRIANGULAR } // Types of UniV3-specific flash loan paths
    struct FlashCallbackData { CallbackType callbackType; uint amount0Borrowed; uint amount1Borrowed; address caller; address poolBorrowedFrom; address token0; address token1; uint24 fee; bytes params; }
    struct TwoHopParams { address tokenIntermediate; uint24 feeA; uint24 feeB; uint amountOutMinimum1; uint amountOutMinimum2; }
    struct TriangularPathParams { address tokenA; address tokenB; address tokenC; uint24 fee1; uint24 fee2; uint24 fee3; uint amountOutMinimumFinal; }
    // SwapStep definition for generic Aave flash loan paths
    struct SwapStep { address pool; address tokenIn; address tokenOut; uint24 fee; uint256 minOut; uint8 dexType; }
    struct ArbParams { SwapStep[] path; address initiator; } // Parameters passed to Aave's executeOperation


    // --- Events ---
    event FlashSwapInitiated(address indexed caller, address indexed pool, CallbackType tradeType, uint amount0, uint amount1);
    event AaveFlashLoanInitiated(address indexed caller, address indexed asset, uint amount);
    event AaveArbitrageExecution(address indexed tokenBorrowed, uint amountBorrowed, uint feePaid);
    event ArbitrageExecution(CallbackType indexed tradeType, address indexed tokenBorrowed, uint amountBorrowed, uint feePaid);
    event SwapExecuted(uint swapNumber, uint8 dexType, address indexed tokenIn, address indexed tokenOut, uint amountIn, uint amountOut);
    event RepaymentSuccess(address indexed token, uint amountRepaid);
    event ProfitTransferred(address indexed token, address indexed recipient, uint amount);
    event TitheDistributed(address indexed token, address indexed titheRecipient, uint titheAmount, address indexed owner, uint ownerAmount);
    event EmergencyWithdrawal(address indexed token, address indexed recipient, uint amount);
    event TradeProfit(bytes32 indexed pathHash, address indexed tokenBorrowed, uint256 grossProfit, uint256 feePaid, uint256 netProfit);


    // --- Modifiers ---
    modifier onlyOwner() { require(msg.sender == owner, "FS:NA"); _; }


    // --- Constructor ---
    constructor(
        address _uniswapV3Router,
        address _sushiRouter,
        address _aavePoolAddress,
        address _aaveAddressesProvider,
        address payable _titheRecipient,
        uint16 _titheBps
    ) {
        require(_uniswapV3Router != address(0), "FS:IUR");
        require(_sushiRouter != address(0), "FS:ISR");
        require(_aavePoolAddress != address(0), "FS:IAP");
        require(_aaveAddressesProvider != address(0), "FS:IAAP");
        require(_titheBps <= MAX_TITHE_BPS, "FS:TBT"); // Tithe basis points too high
        
        // If tithe is enabled, recipient must be valid
        if (_titheBps > 0) {
            require(_titheRecipient != address(0), "FS:ITR"); // Invalid tithe recipient
        }

        swapRouter = ISwapRouter(_uniswapV3Router);
        sushiRouter = IUniswapV2Router02(_sushiRouter);
        aavePool = IPool(_aavePoolAddress);
        aaveAddressesProvider = _aaveAddressesProvider;
        owner = payable(msg.sender); // owner is the deployer, receives the main profit share
        titheRecipient = _titheRecipient;
        titheBps = _titheBps;
    }

    // --- Aave IFlashLoanReceiver Interface Implementations ---
    function addressesProvider() external view override returns (address) {
        return aaveAddressesProvider;
    }

    function pool() external view override returns (address) {
        return address(aavePool);
    }

    // --- Uniswap V3 Flash Callback ---
    // Called by Uniswap V3 pool after successful flash loan
    // msg.sender is the Uniswap V3 pool contract
    function uniswapV3FlashCallback( uint256 fee0, uint256 fee1, bytes calldata data ) external override nonReentrant {
        FlashCallbackData memory decodedData = abi.decode(data, (FlashCallbackData));

        PoolAddress.PoolKey memory poolKey = PoolAddress.PoolKey({ token0: decodedData.token0, token1: decodedData.token1, fee: decodedData.fee });
        require(msg.sender == decodedData.poolBorrowedFrom, "FS:CBW");
        CallbackValidation.verifyCallback(v3Factory, poolKey);

        address tokenBorrowed;
        uint amountBorrowed;
        uint totalAmountToRepay;
        uint feePaid;

        if (decodedData.amount1Borrowed > 0) {
            require(decodedData.amount0Borrowed == 0, "FS:BTB");
            tokenBorrowed = decodedData.token1;
            amountBorrowed = decodedData.amount1Borrowed;
            feePaid = fee1;
            totalAmountToRepay = amountBorrowed + feePaid;
        } else { // decodedData.amount0Borrowed > 0
            require(decodedData.amount1Borrowed == 0 && decodedData.amount0Borrowed > 0, "FS:BNA");
            tokenBorrowed = decodedData.token0;
            amountBorrowed = decodedData.amount0Borrowed;
            feePaid = fee0;
            totalAmountToRepay = amountBorrowed + feePaid;
        }

        emit ArbitrageExecution(decodedData.callbackType, tokenBorrowed, amountBorrowed, feePaid);

        // --- Execute Swaps ---
        uint finalAmountReceived;
        if (decodedData.callbackType == CallbackType.TRIANGULAR) {
            finalAmountReceived = _executeTriangularSwaps(tokenBorrowed, amountBorrowed, decodedData.params);
        } else if (decodedData.callbackType == CallbackType.TWO_HOP) {
            finalAmountReceived = _executeTwoHopSwaps(tokenBorrowed, amountBorrowed, decodedData.params);
        } else {
            revert("FS:UCT");
        }

        // --- Repay Loan and Handle Profit ---
        uint currentBalanceBorrowedToken = IERC20(tokenBorrowed).balanceOf(address(this));

        // Profit calculation happens BEFORE repayment/distribution
        // Ensure contract balance is sufficient to repay
        require(currentBalanceBorrowedToken >= totalAmountToRepay, "FS:IFR");

        uint grossProfit = currentBalanceBorrowedToken > amountBorrowed ? currentBalanceBorrowedToken - amountBorrowed : 0;
        uint netProfit = currentBalanceBorrowedToken > totalAmountToRepay ? currentBalanceBorrowedToken - totalAmountToRepay : 0; // Net profit is AFTER repayment amount+fee

        // Repay the flash loan *first*
        IERC20(tokenBorrowed).safeTransfer(msg.sender, totalAmountToRepay);
        emit RepaymentSuccess(tokenBorrowed, totalAmountToRepay);

        bytes32 pathHash = keccak256(decodedData.params); // Use params from the callback data for hash
        emit TradeProfit(pathHash, tokenBorrowed, grossProfit, feePaid, netProfit);

        // Distribute net profit with tithe system
        _distributeProfits(tokenBorrowed, netProfit);
    }

    // --- AAVE V3 Flash Loan Callback ---
    // Called by Aave Pool after successful flash loan
    // msg.sender is the Aave Pool contract
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override nonReentrant returns (bool) {
        require(msg.sender == address(aavePool), "FS:CBA");
        require(initiator == address(this), "FS:IFI"); // Initiator must be this contract
        require(assets.length == 1, "FS:MA"); // Assuming only one asset is borrowed at a time for arbitrage
        require(assets.length == amounts.length && amounts.length == premiums.length, "FS:ALA");

        // Decode params to get the path and the dynamic Tithe recipient
        ArbParams memory decodedParams = abi.decode(params, (ArbParams));

        address tokenBorrowed = assets[0];
        uint amountBorrowed = amounts[0];
        uint feePaid = premiums[0]; // Premium is the fee charged by Aave

        emit AaveArbitrageExecution(tokenBorrowed, amountBorrowed, feePaid);

        // --- Execute Swaps ---
        // This function executes the sequence of swaps defined in decodedParams.path
        uint finalAmountReceived = _executeSwapPath(decodedParams.path);
        require(finalAmountReceived > 0, "FS:AZA");

        // --- Repay Loan and Handle Profit ---
        uint totalAmountToRepay = amountBorrowed + feePaid;
        uint currentBalanceBorrowedTokenAfterSwaps = IERC20(tokenBorrowed).balanceOf(address(this));

        // Ensure contract balance is sufficient to repay the flash loan + Aave fee
        require(currentBalanceBorrowedTokenAfterSwaps >= totalAmountToRepay, "FS:IFR");

        uint grossProfit = currentBalanceBorrowedTokenAfterSwaps > amountBorrowed ? currentBalanceBorrowedTokenAfterSwaps - amountBorrowed : 0;
        uint netProfit = currentBalanceBorrowedTokenAfterSwaps > totalAmountToRepay ? currentBalanceBorrowedTokenAfterSwaps - totalAmountToRepay : 0; // Net profit is AFTER repayment amount+fee

        // Repay the flash loan *first*
        _approveSpenderIfNeeded(tokenBorrowed, address(aavePool), totalAmountToRepay); // Approve Aave Pool to pull funds
        // Aave's flashLoan function automatically handles pulling the repayment amount from this contract
        // No need for an explicit safeTransfer out to Aave here, the require(return == true) in Aave's loan handles it.
        // However, emitting RepaymentSuccess here is fine for logging.
        emit RepaymentSuccess(tokenBorrowed, totalAmountToRepay);

        bytes32 pathHash = keccak256(params); // Hash of the parameters sent to executeOperation
        emit TradeProfit(pathHash, tokenBorrowed, grossProfit, feePaid, netProfit);

        // Distribute net profit with tithe system (70/30 split)
        _distributeProfits(tokenBorrowed, netProfit);

        return true; // Signal successful execution to Aave
    }

    // --- Internal functions for UniV3 Flash Loan Flow ---
    // Executes a 2-hop swap sequence: BorrowedToken -> IntermediateToken -> BorrowedToken
    function _executeTwoHopSwaps( address _tokenBorrowed, uint _amountBorrowed, bytes memory _params ) internal returns (uint finalAmount) {
        TwoHopParams memory arbParams = abi.decode(_params, (TwoHopParams));

        // Swap 1: Borrowed Token -> Intermediate Token
        _approveSpenderIfNeeded(_tokenBorrowed, address(swapRouter), _amountBorrowed);
        uint amountIntermediateReceived = _executeSingleV3Swap(
            1,
            _tokenBorrowed,
            arbParams.tokenIntermediate,
            arbParams.feeA,
            _amountBorrowed,
            arbParams.amountOutMinimum1
        );
        require(amountIntermediateReceived > 0, "FS:S1Z");

        // Swap 2: Intermediate Token -> Borrowed Token
        _approveSpenderIfNeeded(arbParams.tokenIntermediate, address(swapRouter), amountIntermediateReceived);
        finalAmount = _executeSingleV3Swap(
            2,
            arbParams.tokenIntermediate,
            _tokenBorrowed,
            arbParams.feeB,
            amountIntermediateReceived,
            arbParams.amountOutMinimum2
        );
         require(finalAmount > 0, "FS:S2Z");
         // Note: Profit calculation and repayment are handled in uniswapV3FlashCallback
    }

    // Executes a 3-hop swap sequence: TokenA -> TokenB -> TokenC -> TokenA
    function _executeTriangularSwaps( address _tokenA, uint _amountA, bytes memory _params ) internal returns (uint finalAmount) {
        TriangularPathParams memory pathParams = abi.decode(_params, (TriangularPathParams));
        require(pathParams.tokenA == _tokenA, "FS:TPA");

        // Swap 1: Token A -> Token B
        _approveSpenderIfNeeded(_tokenA, address(swapRouter), _amountA);
        uint amountB = _executeSingleV3Swap(
            1,
            _tokenA,
            pathParams.tokenB,
            pathParams.fee1,
            _amountA,
            0 // No minOut usually for intermediate hops
        );
        require(amountB > 0, "FS:TS1Z");

        // Swap 2: Token B -> Token C
        _approveSpenderIfNeeded(pathParams.tokenB, address(swapRouter), amountB);
        uint amountC = _executeSingleV3Swap(
            2,
            pathParams.tokenB,
            pathParams.tokenC,
            pathParams.fee2,
            amountB,
            0 // No minOut usually for intermediate hops
        );
        require(amountC > 0, "FS:TS2Z");

        // Swap 3: Token C -> Token A
        _approveSpenderIfNeeded(pathParams.tokenC, address(swapRouter), amountC);
        finalAmount = _executeSingleV3Swap(
            3,
            pathParams.tokenC,
            _tokenA,
            pathParams.fee3,
            amountC,
            pathParams.amountOutMinimumFinal // minOut applied to the final hop
        );
         require(finalAmount > 0, "FS:TS3Z");
         // Note: Profit calculation and repayment are handled in uniswapV3FlashCallback
    }

    // Executes a single swap using Uniswap V3's exactInputSingle function
    function _executeSingleV3Swap( uint _swapNumber, address _tokenIn, address _tokenOut, uint24 _fee, uint _amountIn, uint _amountOutMinimum ) internal returns (uint amountOut) {
        ISwapRouter.ExactInputSingleParams memory swapParams = ISwapRouter.ExactInputSingleParams({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            fee: _fee,
            recipient: address(this),
            deadline: block.timestamp + DEADLINE_OFFSET,
            amountIn: _amountIn,
            amountOutMinimum: _amountOutMinimum,
            sqrtPriceLimitX96: 0
        });

        try swapRouter.exactInputSingle(swapParams) returns (uint _amountOut) {
            amountOut = _amountOut;
            emit SwapExecuted(_swapNumber, DEX_TYPE_UNISWAP_V3, _tokenIn, _tokenOut, _amountIn, amountOut);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("FS:S", _numToString(_swapNumber) ,"F:", reason)));
        } catch {
            revert(string(abi.encodePacked("FS:S", _numToString(_swapNumber), "FL")));
        }
    }

    // --- _executeSwapPath (General path executor for Aave flash loans) ---
    // Executes a sequence of swaps defined by the _path array across supported DEXs.
    function _executeSwapPath(SwapStep[] memory _path) internal returns (uint finalAmount) {
        uint amountIn = IERC20(_path[0].tokenIn).balanceOf(address(this));
        require(amountIn > 0, "FS:PSA0");

        for (uint i = 0; i < _path.length; i++) {
            SwapStep memory step = _path[i];
            uint amountOut = 0;

            address spender = address(0);
            if (step.dexType == DEX_TYPE_UNISWAP_V3) {
                spender = address(swapRouter);
            } else if (step.dexType == DEX_TYPE_SUSHISWAP) {
                 spender = address(sushiRouter);
            }
            // Add condition for Camelot if it uses a router vs direct pool interaction
            // else if (step.dexType == DEX_TYPE_CAMELOT) { ... }
             else if (step.dexType == DEX_TYPE_DODO) {
                 spender = step.pool; // DODO uses the pool address as spender for sellBase/buyBase
             }
             else {
                 revert("FS:IDT_APPROVE"); // Invalid DEX type for approval
             }

            // Approve the spender for the current amountIn before the swap
            _approveSpenderIfNeeded(step.tokenIn, spender, amountIn);


            if (step.dexType == DEX_TYPE_UNISWAP_V3) {
                amountOut = _executeSingleV3Swap(
                    i+1, // Swap number (1-based index)
                    step.tokenIn,
                    step.tokenOut,
                    step.fee,
                    amountIn, // Use the current amountIn balance
                    step.minOut // minOut applies only to the last step, handled in builder
                );
            } else if (step.dexType == DEX_TYPE_SUSHISWAP) {
                address[] memory path = new address[](2);
                path[0] = step.tokenIn;
                path[1] = step.tokenOut;

                // Sushi V2 style swap (swapExactTokensForTokens)
                try sushiRouter.swapExactTokensForTokens(
                    amountIn, // Use the current amountIn balance
                    step.minOut, // minOut applies only to the last step, handled in builder
                    path,
                    address(this), // Send output to this contract
                    block.timestamp + DEADLINE_OFFSET
                ) returns (uint[] memory amounts) {
                    amountOut = amounts[amounts.length - 1]; // Output is the last element of the returned amounts array
                    emit SwapExecuted(i+1, DEX_TYPE_SUSHISWAP, step.tokenIn, step.tokenOut, amountIn, amountOut);
                } catch Error(string memory reason) {
                    revert(string(abi.encodePacked("FS:S", _numToString(i+1), "SF:", reason)));
                } catch {
                    revert(string(abi.encodePacked("FS:S", _numToString(i+1), "SFL")));
                }
            } else if (step.dexType == DEX_TYPE_DODO) {
                // --- DODO Swaps (Need to re-implement based on DODO interface/logic) ---
                // The IDODOV1V2Pool interface needs to match the specific DODO pool type.
                // You'll likely need to call sellBase() or buyBase() depending on the trade direction for this step.
                // Example implementation (requires correct IDODOV1V2Pool interface):
                // IDODOV1V2Pool dodoPool = IDODOV1V2Pool(step.pool); // Commented out - unused while DODO is disabled
                // You might need pool-specific logic or functions like baseToken()/quoteToken() if available in your interface
                // or pass base/quote tokens in the SwapStep struct if the interface is generic.
                // For now, keeping the revert as in the original code until DODO execution is fully tackled in Phase 2.
                revert("FS:DODO_TEMP_DISABLED"); // Still disabled as per original code/roadmap

                /*
                // Example re-implementation pseudocode (requires IDODOV1V2Pool to have baseToken/quoteToken/sellBase/buyBase):
                address baseToken = dodoPool.baseToken(); // Check interface
                address quoteToken = dodoPool.quoteToken(); // Check interface

                if (step.tokenIn == baseToken && step.tokenOut == quoteToken) {
                    // Selling Base token
                    try dodoPool.sellBase(amountIn, step.minOut, address(this), block.timestamp + DEADLINE_OFFSET) returns (uint256 receivedAmount) {
                        amountOut = receivedAmount;
                        emit SwapExecuted(i+1, DEX_TYPE_DODO, step.tokenIn, step.tokenOut, amountIn, amountOut);
                    } catch Error(string memory reason) { revert(string(abi.encodePacked("FS:D", _numToString(i+1), "SF:", reason))); } catch { revert(string(abi.encodePacked("FS:D", _numToString(i+1), "SFL"))); }
                } else if (step.tokenIn == quoteToken && step.tokenOut == baseToken) {
                    // Buying Base token (selling Quote)
                    try dodoPool.buyBase(amountIn, step.minOut, address(this), block.timestamp + DEADLINE_OFFSET) returns (uint256 receivedAmount) {
                        amountOut = receivedAmount;
                        emit SwapExecuted(i+1, DEX_TYPE_DODO, step.tokenIn, step.tokenOut, amountIn, amountOut);
                    } catch Error(string memory reason) { revert(string(abi.encodePacked("FS:D", _numToString(i+1), "BF:", reason))); } catch { revert(string(abi.encodePacked("FS:D", _numToString(i+1), "BFL"))); }
                } else {
                    revert("FS:DODO_INVALID_PAIR"); // Should be caught off-chain by fetcher/finder logic
                }
                */
            } else {
                revert("FS:IDT_EXEC"); // Invalid DEX type for execution
            }

            // Update amountIn for the next step
            amountIn = amountOut;
            // Ensure we received a positive amount from the swap
            require(amountIn > 0, string(abi.encodePacked("FS:PS", _numToString(i+1), "Z")));
        }

        finalAmount = amountIn; // The final amount received after the last swap
    }

    // --- Helper Functions ---
    // Distributes net profit between tithe recipient and owner based on configured percentage
    function _distributeProfits(address _token, uint256 _netProfit) internal {
        if (_netProfit == 0) return;
        
        uint256 titheAmount = 0;
        uint256 ownerAmount = _netProfit;
        
        // Calculate and distribute tithe if configured
        if (titheBps > 0 && titheRecipient != address(0)) {
            titheAmount = (_netProfit * titheBps) / 10000;
            ownerAmount = _netProfit - titheAmount;
            
            // Transfer tithe portion
            if (titheAmount > 0) {
                IERC20(_token).safeTransfer(titheRecipient, titheAmount);
            }
        }
        
        // Transfer owner portion
        if (ownerAmount > 0) {
            IERC20(_token).safeTransfer(owner, ownerAmount);
        }
        
        // Emit consolidated event
        if (titheBps > 0 && titheRecipient != address(0)) {
            emit TitheDistributed(_token, titheRecipient, titheAmount, owner, ownerAmount);
        } else {
            emit ProfitTransferred(_token, owner, ownerAmount);
        }
    }

    // Approves spender for maximum amount if current allowance is less than max uint256.
    // Prevents issues with allowances needing to be reset after spending.
    // Using type(uint256).max is standard practice for DEX routers/pools.
    function _approveSpenderIfNeeded(address _token, address _spender, uint _amount) internal {
         if (_amount == 0) { return; } // No need to approve if amount is zero
        // Check current allowance. If it's less than uint256.max, approve max.
        if (IERC20(_token).allowance(address(this), _spender) < type(uint256).max) {
            IERC20(_token).forceApprove(_spender, type(uint256).max);
        }
    }

     // Helper function to convert uint to string (for revert messages)
    function _numToString(uint _num) internal pure returns (string memory) {
        if (_num == 0) return "0";
        uint j = _num;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_num != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_num % 10)); // Convert digit to ASCII character
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _num /= 10;
        }
        return string(bstr);
    }


    // --- External Functions ---
    // Initiates a Uniswap V3 flash loan by calling the pool's flash function.
    // This contract acts as the receiver.
    function initiateUniswapV3FlashLoan(
        CallbackType callbackType,
        address poolAddress, // The V3 pool address
        uint amount0, // Amount of token0 to borrow
        uint amount1, // Amount of token1 to borrow
        bytes calldata params // Encoded parameters for the callback logic (e.g., TwoHopParams or TriangularPathParams)
    ) external onlyOwner {
        IUniswapV3Pool uniswapPool = IUniswapV3Pool(poolAddress);
        address token0 = uniswapPool.token0();
        address token1 = uniswapPool.token1();
        uint24 fee = uniswapPool.fee();

        // Encode data to be passed to uniswapV3FlashCallback
        bytes memory data = abi.encode(
            FlashCallbackData({
                callbackType: callbackType,
                amount0Borrowed: amount0,
                amount1Borrowed: amount1,
                caller: msg.sender, // Should be 'owner' based on onlyOwner modifier
                poolBorrowedFrom: poolAddress,
                token0: token0,
                token1: token1,
                fee: fee,
                params: params
            })
        );

        emit FlashSwapInitiated(msg.sender, poolAddress, callbackType, amount0, amount1);

        // Initiate the flash loan from the V3 pool
        uniswapPool.flash(address(this), amount0, amount1, data);
    }

    // Initiates an Aave V3 flash loan by calling the Aave pool's flashLoan function.
    // This contract acts as the receiver.
    function initiateAaveFlashLoan(
        address asset, // The asset to borrow
        uint amount, // The amount to borrow
        bytes calldata params // Encoded ArbParams struct containing swap path and initiator
    ) external onlyOwner {
        address[] memory assets = new address[](1);
        assets[0] = asset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        uint256[] memory modes = new uint256[](1); // 0 = NoDebt, 1 = Stable, 2 = Variable
        modes[0] = 0; // Arbitrage usually uses NoDebt flash loans

        // The 'params' argument for Aave's flashLoan contains custom data
        // that Aave will pass back to our executeOperation function.
        // This is where we put our encoded ArbParams struct.
        bytes memory paramsForAave = params; // Pass the params received from the off-chain caller directly

        // Decode params only for logging the recipient in the event here
        ArbParams memory decodedParamsForEvent = abi.decode(paramsForAave, (ArbParams));
        emit AaveFlashLoanInitiated(decodedParamsForEvent.initiator, asset, amount);

        // Initiate the flash loan from the Aave Pool
        aavePool.flashLoan(
            address(this), // receiverAddress: This contract
            assets,
            amounts,
            modes,
            address(this), // onBehalfOf: This contract (msg.sender for Aave)
            paramsForAave, // params: Our custom data (encoded ArbParams)
            0 // referralCode
        );
    }

    // --- Emergency Functions ---
    // Allows owner to withdraw stranded ERC20 tokens
    function emergencyWithdraw(address token) external onlyOwner {
        uint balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "FS:NW");
        IERC20(token).safeTransfer(owner, balance);
        emit EmergencyWithdrawal(token, owner, balance);
    }

    // Allows owner to withdraw stranded Ether
    function emergencyWithdrawETH() external onlyOwner nonReentrant {
        uint balance = address(this).balance;
        require(balance > 0, "FS:NWE");
        emit EmergencyWithdrawal(address(0), owner, balance);
        (bool sent, ) = owner.call{value: balance}("");
        require(sent, "FS:ETF");
    }

    // --- Fallback ---
    receive() external payable {} // Allows receiving Ether
}

