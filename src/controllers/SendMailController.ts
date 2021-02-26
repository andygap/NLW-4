import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository copy";
import { UserRepository } from "../repositories/userRepository";
import SendMailService from "../services/SendMailService";
import { resolve } from "path";

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = await getCustomRepository(UserRepository);
    const surveysRepository = await getCustomRepository(SurveysRepository);
    const surveysUsersRepository = await getCustomRepository(
      SurveysUsersRepository
    );

    const user = await usersRepository.findOne({ email });

    if (!user) {
      return response.status(400).json({
        error: "User already exists",
      });
    }

    const survey = await surveysRepository.findOne({
      id: survey_id,
    });

    if (!survey) {
      return response.status(400).json({
        error: "Survey does not exists",
      });
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    });

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

    await surveysUsersRepository.save(surveyUser);

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      link:
    };

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response.json(surveyUser);
  }
}

export { SendMailController };
