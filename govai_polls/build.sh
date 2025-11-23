#!/bin/bash
# Build script that uses newer platform tools (v1.51 with Rust 1.84.1)
# This workaround is needed because Anchor's default platform tools use Rust 1.75.0

# First generate IDL if needed
anchor idl build

# Build using the newer platform tools
cargo build-sbf --tools-version v1.51 --manifest-path programs/govai_polls/Cargo.toml

# Copy the built program to target/deploy
mkdir -p target/deploy
cp target/sbpf-solana-solana/release/govai_polls.so target/deploy/govai_polls.so 2>/dev/null || true

