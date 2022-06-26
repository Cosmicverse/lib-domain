/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot org>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import test from 'ava'

import { guardFor } from '@cosmicverse/foundation'

import {
  Entity,
  defineEntity,
  createEntity,
} from '../../src'

interface User extends Entity {
  name: string
}

const createUser = defineEntity<User>({
  properties: {
    id: {
      validate: (value: string): boolean => 2 < value.length,
    },
    created: {
      validate: (value: Date): boolean => value instanceof Date,
    },
    name: {
      validate: (value: string): boolean => 2 < value.length,
    },
  },
})

interface EmailValue {
  value: string
}

type Member = User & {
  readonly email: EmailValue
}

test('Entity: createEntity', t => {
  const id = '123'
  const created = new Date()
  const name = 'daniel'
  const email = createEntity({
    value: 'my@email.com',
  }, {
    properties: {
      value: {
        validate(value: string, state: Readonly<EmailValue>): boolean {
          return 5 < value.length && value !== state.value
        },
      },
    },
  })

  const target: Member = {
    id,
    created,
    name,
    email,
  }

  const proxy = createEntity(target, {
    properties: {
      email: {
        validate(value: EmailValue): boolean {
          return guardFor(value)
        },
      },
    },
  })

  t.is(email.value, proxy.email.value)

  proxy.email.value = 'address@domain.com'

  t.is(proxy.id, id)
  t.is(proxy.created, created)
  t.is(proxy.name, name)
  t.is('address@domain.com', proxy.email.value)
})

test('Entity: interface', t => {
  const id = '123'
  const created = new Date()
  const name = 'daniel'

  const u1 = createUser({
    id,
    created,
    name: 'jonathan',
  })

  u1.name = 'daniel'

  t.is(u1.id, id)
  t.is(u1.created, created)
  t.is(u1.name, name)
})

test('Entity: partial validator', t => {
  const id = '123'
  const created = new Date()
  const name = 'daniel'

  const u1 = createUser({
    id,
    created,
    name: 'jonathan',
  })

  u1.name = ''

  t.is(u1.id, id)
  t.is(u1.created, created)
  t.not(name, u1.name)
})
