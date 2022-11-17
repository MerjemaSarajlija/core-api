import { Field, InputType } from "type-graphql";

@InputType()
export class AddAvailabilityInput {
  @Field()
  dayOfWeek: number;

  @Field()
  startTimeUtc: string;

  @Field()
  endTimeUtc: string;

  @Field()
  doctor: number;
}