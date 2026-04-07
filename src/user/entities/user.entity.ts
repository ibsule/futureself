import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: null })
  first_name: string;

  @Column({ nullable: true, default: null })
  last_name: string;

  @Column({ nullable: true, default: null })
  other_names: string;

  @Column()
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 1 })
  auth_token_version: number;

  @CreateDateColumn()
  created_at: Date;
}
