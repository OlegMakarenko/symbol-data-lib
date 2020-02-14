/*
 *
 * Copyright (c) 2019-present for NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// TODO(ahuszagh) here...
// block_change
// block_sync
// partial_transactions_change
// state_change
// transaction_status
// unconfirmed_transactions_change

// Needs to be root
//  process.getuid() === 0


// block_change
//      void notifyBlock(const model::BlockElement& blockElement) override {
//        io::Write8(*m_pOutputStream, utils::to_underlying_type(subscribers::BlockChangeOperationType::Block));
//        io::WriteBlockElement(blockElement, *m_pOutputStream);
//        if (blockElement.OptionalStatement) {
//          io::Write8(*m_pOutputStream, 0xFF);
//          io::WriteBlockStatement(*blockElement.OptionalStatement, *m_pOutputStream);
//        } else {
//          io::Write8(*m_pOutputStream, 0);
//        }
//
//        m_pOutputStream->flush();
//      }
//
//      void notifyDropBlocksAfter(Height height) override {
//        io::Write8(*m_pOutputStream, utils::to_underlying_type(subscribers::BlockChangeOperationType::Drop_Blocks_After));
//        io::Write(*m_pOutputStream, height);
//        m_pOutputStream->flush();
//      }
