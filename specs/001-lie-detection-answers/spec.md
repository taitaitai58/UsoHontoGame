# Feature Specification: 嘘当て回答機能

**Feature Branch**: `001-lie-detection-answers`
**Created**: 2025-01-19
**Status**: Draft
**Input**: User description: "出題チーム以外のチームが「ウソ」を当てる際の機能"

## Clarifications

### Session 2025-01-19

- Q: How should the system handle a participant who tries to submit answers multiple times for the same game? → A: Allow overwrite until deadline - Participants can resubmit, latest answer counts
- Q: How is a "same participant" identified for tracking submissions and enforcing limits? → A: Session-based with nickname - Track by session cookie, nickname is display name
- Q: What happens when game status changes to "締切" (closed) while participant is filling out answers? → A: Strict cutoff - Any submission attempt after status changes to "締切" is rejected with clear error message
- Q: What happens when participant tries to access answer screen for game with zero presenters? → A: Block at access time - Validate presenter count before showing answer screen, redirect to TOP with error message if zero presenters

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ゲーム参加と回答提出 (Priority: P1)

参加者がTOP画面から出題中のゲームを選択し、各出題者のエピソードの中から嘘を見つけて回答を提出する。これがこの機能の中核となる体験である。

**Why this priority**: ゲームの本質的な目的である「嘘を当てる」という体験を提供する最も重要なフロー。この機能がなければゲームが成立しない。

**Independent Test**: TOP画面に出題中のゲームが表示された状態で、ゲームをクリックして回答画面に遷移し、全出題者の嘘を選択してsubmitできることで完全にテスト可能。参加者に基本的なゲーム体験を提供できる。

**Acceptance Scenarios**:

1. **Given** TOP画面に出題中のゲームが1つ以上表示されている, **When** 参加者がゲームを選択する, **Then** 回答画面に遷移し、全出題者のエピソードが表示される
2. **Given** 回答画面で全出題者のエピソードが表示されている, **When** 参加者が各出題者につき1つのエピソードを嘘として選択する, **Then** 選択状態が視覚的に表示される
3. **Given** 全出題者の嘘エピソードを選択済み, **When** submitボタンを押す, **Then** 回答が保存されTOP画面に遷移する
4. **Given** 一部の出題者の嘘エピソードが未選択, **When** submitボタンを押そうとする, **Then** 全選択が必須である旨のメッセージが表示される

---

### User Story 2 - 参加人数制限の適用 (Priority: P2)

ゲームの設定された参加上限に達した場合、それ以上の参加者を受け付けないことで、ゲームの公平性と進行を保証する。

**Why this priority**: ゲームの品質と公平性を保つために重要だが、P1の基本機能が動作すれば、一時的に制限なしでもゲームは成立する。

**Independent Test**: 参加上限が設定されたゲームを用意し、上限数の参加者が回答を提出した後、新しい参加者がアクセスしようとすると参加不可のメッセージが表示されることで独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** ゲームの参加上限が5名で現在4名が参加済み, **When** 5人目の参加者が回答画面にアクセスする, **Then** 回答画面が正常に表示される
2. **Given** ゲームの参加上限が5名で既に5名が参加済み, **When** 6人目の参加者が回答画面にアクセスしようとする, **Then** 参加上限に達している旨のエラーメッセージが表示され、TOP画面に戻る
3. **Given** 回答画面で回答を入力中, **When** その間に参加上限に達した, **Then** 既に開始した参加者はsubmit可能である

---

### User Story 3 - ゲーム状態検証 (Priority: P3)

出題中以外の状態のゲーム（準備中や締切）に回答しようとした場合、適切なエラーメッセージを表示することで、ユーザーに正しい状態を伝える。

**Why this priority**: エラーハンドリングとして重要だが、正常な使用フローではユーザーは出題中のゲームのみを選択するため、優先度は低い。

**Independent Test**: 準備中のゲームと締切状態のゲームをそれぞれ用意し、これらのゲームに直接アクセスしようとすると適切なエラーメッセージが表示されることで独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** ゲームが「準備中」状態, **When** 参加者が回答画面にアクセスしようとする, **Then** 「このゲームはまだ出題されていません」というエラーメッセージが表示され、TOP画面に戻る
2. **Given** ゲームが「締切」状態, **When** 参加者が回答画面にアクセスしようとする, **Then** 「このゲームは既に締め切られました」というエラーメッセージが表示され、TOP画面に戻る
3. **Given** TOP画面に出題中のゲームのみが表示されている, **When** 参加者がゲーム一覧を見る, **Then** 準備中や締切のゲームは表示されない

---

### Edge Cases

- 参加者が回答画面を開いている最中にゲームステータスが「締切」に変更された場合、submit時に検証され、締切後の提出は明確なエラーメッセージとともに拒否される。作業中の選択は失われる。
- 参加者が回答を選択中にネットワーク接続が切れた場合、選択状態は保持されるか？
- 同じ参加者が複数回同じゲームに回答する場合、最新の回答で上書きされる。締切後は再提出不可。
- 出題者が1名もいないゲームに参加しようとした場合、回答画面アクセス時に出題者数を検証し、0名の場合は「このゲームには出題者がいません」というエラーメッセージを表示してTOP画面に戻る。
- 参加者が回答画面で長時間（例：1時間以上）滞在した場合、セッションはどうなるか？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST TOP画面で出題中状態のゲームのみを表示する
- **FR-002**: System MUST 参加者がTOP画面からゲームを選択したとき、回答画面に遷移する
- **FR-003**: System MUST 回答画面で全出題者とそれぞれの複数エピソードを表示する
- **FR-004**: System MUST 参加者が各出題者につき1つのエピソードを嘘として選択できるようにする
- **FR-005**: System MUST 全出題者の嘘エピソードが選択されるまでsubmitボタンを無効化する
- **FR-006**: System MUST submitが押されたとき、選択された回答を保存する
- **FR-007**: System MUST 回答submit後、自動的にTOP画面に遷移する
- **FR-008**: System MUST ゲームごとに設定された参加上限を適用する
- **FR-009**: System MUST 参加上限に達したゲームへのアクセスを拒否し、適切なエラーメッセージを表示する
- **FR-010**: System MUST 出題中以外の状態（準備中、締切）のゲームへの回答画面アクセスを拒否する
- **FR-011**: System MUST 状態エラー時には状態に応じた明確なエラーメッセージを表示する
- **FR-012**: System MUST セッションCookieにより参加者を識別し、セッションに紐付いたニックネームを回答に関連付ける
- **FR-013**: System MUST 同じセッションの参加者が同じゲームに複数回回答した場合、最新の回答で上書きする（締切前のみ）
- **FR-014**: System MUST submit時にゲーム状態を再検証し、「締切」状態の場合は回答を拒否して明確なエラーメッセージを表示する
- **FR-015**: System MUST 回答画面アクセス時に出題者数を検証し、0名の場合はエラーメッセージを表示してTOP画面に戻る

### Key Entities

- **回答 (Answer)**: 参加者による嘘エピソードの選択記録。セッションID、ニックネーム、ゲームID、出題者ごとの選択エピソードID、回答日時を含む。同一セッションからの再提出時は既存回答を上書き更新する
- **参加記録 (Participation)**: ゲームへの参加状態を管理。ゲームID、セッションID、ニックネーム、参加日時を記録し、参加上限の管理に使用する
- **ゲーム状態 (Game Status)**: ゲームの現在の状態（準備中、出題中、締切）を示す。回答可能性の判定に使用する

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 参加者が回答画面で全出題者の嘘を選択してsubmitするまでの時間が平均3分以内である
- **SC-002**: 参加上限に達したゲームへのアクセス試行の100%が適切にブロックされる
- **SC-003**: 出題中以外のゲームへのアクセス試行の100%が適切にブロックされ、明確なエラーメッセージが表示される
- **SC-004**: 回答submit成功率が95%以上である（ネットワークエラーを除く）
- **SC-005**: 参加者の90%以上が回答画面のUIを直感的に理解でき、操作に迷わない
