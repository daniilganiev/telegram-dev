# Acton test recipes

Source: https://ton-blockchain.github.io/acton/llms.mdx/docs/testing/cookbook.md. Tests live in
files ending `.test.tolk`. Check the docs for the exact imports your Acton version needs
(`acton new` generates a working example; start from it).

## Shared setup

```tolk
fun setupCounter(): (Counter, Treasury, Treasury) {
    val deployer = testing.treasury("deployer");
    val outsider = testing.treasury("outsider");
    val counter = Counter.fromStorage({ /* initial storage */ });
    val deploy = counter.deploy(deployer.address, { value: grams("1") });
    expect(deploy).toHaveSuccessfulDeploy({ to: counter.address });
    return (counter, deployer, outsider);
}
```

## Success and failure

```tolk
val res = counter.sendIncreaseCounter(deployer.address, 123);
expect(res).toHaveSuccessfulTx<IncreaseCounter>({ from: deployer.address, to: counter.address });
expect(res).toHaveAllSuccessfulTxs();

val bad = counter.sendIncreaseCounter(outsider.address, 1);
expect(bad).toHaveFailedTx<IncreaseCounter>({
    from: outsider.address, to: counter.address, exitCode: Errors.NotOwner,
});
```

## Bounces

```tolk
val bounced = createMessage({
    bounce: false, value: grams("0.1"), dest: counter.address,
    body: IncreaseCounter { increaseBy: 10 },
}).bounced();
expect(net.send(deployer.address, bounced)).toHaveBouncedTx({ to: counter.address });
```

## Inspecting the chain of messages

```tolk
val response = res.findTransaction<ResponseWalletAddress>({ from: minter.address, to: owner.address });
val body = response!.loadBody<ResponseWalletAddress>();
```

## External messages and time

```tolk
expect(wallet.sendExternalSigned(body)).toBeAccepted();
expect(wallet.sendExternalSigned(badBody)).toHaveExternalVmExitCode(Errors.BadSignature);
testing.setNow(1700000000);
val expiresAt = testing.getNow() + 3600;
```

## Gas and state

```tolk
expect(res.at(0)).toConsumeLessThan(1500);
val state = testing.getAccountState(counter.address);
expect(state).toBeNotNull();
```

Gas regression in CI: `acton test --snapshot gas.json` once, then
`acton test --baseline-snapshot gas.json`.

## Attributes

`@test.fail_with(Errors.NotOwner)`, `@test.gas_limit(5000)`, `@test.fuzz({ runs: 64, seed: 42 })`.

## What a good TON test suite covers

Happy path; wrong sender; insufficient value; every opcode, including unknown ones; bounced
outgoing messages; replay of external messages; boundary amounts (0, 1, max); expiry and time;
admin rotation; spoofed notifications for token contracts; gas ceilings. Then run
`acton test --coverage --coverage-minimum-percent <n>` and `acton test --mutate` to see whether
the tests actually catch changes.
