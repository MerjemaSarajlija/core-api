import { Appointment } from "@/entities/Appointment";
import { BookAppointmentInput } from "@/models/appointments/BookAppointmentInput";
import { AppointmentService } from "@/services/AppointmentService";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class AppointmentResolver {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}
  
  @Query(() => [Appointment])
  async appointments(): Promise<Appointment[]> {
    return await this.appointmentService.getAppointments();
  }

  @Mutation(() => Appointment)
  async bookAppointment(
    @Arg("bookAppointmentInput") bookAppointmentInput: BookAppointmentInput,
  ): Promise<Appointment> {
    return await this.appointmentService.bookAppointment(bookAppointmentInput)
  }
}